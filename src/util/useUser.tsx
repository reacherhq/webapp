import type { User } from "@supabase/gotrue-js";
import React, { createContext, useContext, useEffect, useState } from "react";

import { sentryException } from "./sentry";
import { Database, Tables } from "@/supabase/database.types";
import { SubscriptionWithPrice } from "@/supabase/domain.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

interface UserContext {
	supabase: SupabaseClient;
	subscription: SubscriptionWithPrice | null;
	user: User | null;
	userDetails: Tables<"users"> | null;
	subscriptionLoaded: boolean;
	userLoaded: boolean;
}

export const UserContext = createContext({} as UserContext);

interface UserContextProviderProps {
	children: React.ReactNode;
}

export const UserContextProvider = (
	props: UserContextProviderProps
): React.ReactElement => {
	const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [userLoaded, setUserLoaded] = useState(false);
	const supabase = createClientComponentClient<Database>();
	const [userDetails, setUserDetails] = useState<Tables<"users"> | null>(
		null
	);
	const [subscription, setSubscription] =
		useState<SubscriptionWithPrice | null>(null);

	useEffect(() => {
		supabase.auth
			.getUser()
			.then((res) => {
				if (res.error) {
					throw res.error;
				}
				setUser(res.data.user);
			})
			.catch((error) => {
				sentryException(error);
			})
			.finally(() => {
				setUserLoaded(true);
			});

		supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});
	}, [supabase]);

	useEffect(() => {
		const getUserDetails = () =>
			supabase.from("users").select("*").single();
		const getSubscription = () =>
			supabase
				.from("subscriptions")
				.select("*, prices(*, products(*))")
				.in("status", ["trialing", "active", "past_due"])
				.order("current_period_start", { ascending: false });

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
					setSubscription(sub.data?.[0] as SubscriptionWithPrice);
					setSubscriptionLoaded(true);
				})
				.catch(sentryException);
		}
	}, [supabase, user]);

	const value = {
		user,
		userDetails,
		userLoaded,
		supabase,
		subscriptionLoaded,
		subscription,
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
