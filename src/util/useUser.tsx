import type {
	ApiError,
	Provider,
	Session,
	User,
	UserCredentials,
} from "@supabase/gotrue-js";
import React, { createContext, useContext, useEffect, useState } from "react";

import { getWebappURL } from "./helpers";
import { sentryException } from "./sentry";
import { supabase } from "./supabaseClient";
import { Tables } from "@/supabase/database.types";
import { SubscriptionWithPrice } from "@/supabase/domain.types";

interface UserMetadata {
	/**
	 * From where did the user heard Reacher from?
	 */
	heardFrom?: string;
}

interface UserContext {
	session: Session | null;
	signIn: (options: UserCredentials) => Promise<{
		session: Session | null;
		user: User | null;
		provider?: Provider;
		url?: string | null;
		error: ApiError | null;
	}>;
	resetPassword: (
		email: string
	) => Promise<{ data: unknown | null; error: ApiError | null }>;
	signOut: () => Promise<void>;
	signUp: (
		options: UserCredentials,
		userMetadata?: UserMetadata
	) => Promise<{
		session: Session | null;
		user: User | null;
		provider?: Provider;
		url?: string | null;
		error: ApiError | null;
	}>;
	subscription: SubscriptionWithPrice | null;
	user: User | null;
	userDetails: Tables<"users"> | null;
	subscriptionLoaded: boolean;
	userFinishedLoading: boolean;
}

export const UserContext = createContext({} as UserContext);

interface UserContextProviderProps {
	children: React.ReactNode;
}

export const UserContextProvider = (
	props: UserContextProviderProps
): React.ReactElement => {
	const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
	const [userFinishedLoading, setUserFinishedLoading] = useState(false);
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [userDetails, setUserDetails] = useState<Tables<"users"> | null>(
		null
	);
	const [subscription, setSubscription] =
		useState<SubscriptionWithPrice | null>(null);

	useEffect(() => {
		const session = supabase.auth.session();
		setSession(session);
		setUser(session?.user ?? null);
		setUserFinishedLoading(true);
		const { data: authListener } = supabase.auth.onAuthStateChange(
			(_event, session) => {
				setSession(session);
				setUser(session?.user ?? null);
			}
		);

		return () => {
			authListener?.unsubscribe();
		};
	}, []);

	const getUserDetails = () =>
		supabase.from<Tables<"users">>("users").select("*").single();
	const getSubscription = () =>
		supabase
			.from<SubscriptionWithPrice>("subscriptions")
			.select("*, prices(*, products(*))")
			.in("status", ["trialing", "active", "past_due"])
			.order("current_period_start", { ascending: false });
	useEffect(() => {
		if (user) {
			Promise.all([getUserDetails(), getSubscription()])
				.then(([userDetails, sub]) => {
					if (userDetails.error) {
						throw userDetails.error;
					}
					if (sub.error) {
						throw sub.error;
					}
					setUserDetails(userDetails.data);
					setSubscription(sub.data?.[0]);
					setSubscriptionLoaded(true);
					setUserFinishedLoading(true);
				})
				.catch(sentryException);
		}
	}, [user]);

	const value = {
		session,
		user,
		userDetails,
		userFinishedLoading,
		subscriptionLoaded,
		subscription,
		resetPassword: (email: string) =>
			supabase.auth.api.resetPasswordForEmail(email, {
				redirectTo: getWebappURL(),
			}),
		signIn: (creds: UserCredentials) =>
			supabase.auth.signIn(creds, { redirectTo: getWebappURL() }),
		signUp: (creds: UserCredentials, userMetadata?: UserMetadata) =>
			supabase.auth.signUp(creds, {
				redirectTo: getWebappURL(),
				data: userMetadata,
			}),
		signOut: async () => {
			setUserDetails(null);
			setSubscription(null);
			const { error } = await supabase.auth.signOut();
			if (error) throw error;
		},
	};
	return <UserContext.Provider value={value} {...props} />;
};

export function useUser(): UserContext {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error(`useUser must be used within a UserContextProvider.`);
	}

	return context;
}
