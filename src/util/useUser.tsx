import type {
	ApiError,
	Provider,
	Session,
	User,
	UserCredentials,
} from '@supabase/gotrue-js';
import React, {
	createContext,
	FunctionComponent,
	useContext,
	useEffect,
	useState,
} from 'react';

import { getURL } from '../util/helpers';
import { sentryException } from './sentry';
import { supabase, SupabaseSubscription, SupabaseUser } from './supabaseClient';

interface UserMetadata {
	/**
	 * From where did the user heard Reacher from?
	 */
	heard_from?: string;
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
		userMetadata: UserMetadata
	) => Promise<{
		session: Session | null;
		user: User | null;
		provider?: Provider;
		url?: string | null;
		error: ApiError | null;
	}>;
	subscription: SupabaseSubscription | null;
	user: User | null;
	userDetails: SupabaseUser | null;
	userLoaded: boolean;
	userFinishedLoading: boolean;
}

export const UserContext = createContext({} as UserContext);

export const UserContextProvider: FunctionComponent = (
	props
): React.ReactElement => {
	const [userLoaded, setUserLoaded] = useState(false);
	const [userFinishedLoading, setUserFinishedLoading] = useState(false);
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [userDetails, setUserDetails] = useState<SupabaseUser | null>(null);
	const [subscription, setSubscription] =
		useState<SupabaseSubscription | null>(null);

	useEffect(() => {
		const session = supabase.auth.session();
		setSession(session);
		setUser(session?.user ?? null);
		if (!session?.user) {
			setUserFinishedLoading(true);
		}
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
		supabase.from<SupabaseUser>('users').select('*').single();
	const getSubscription = () =>
		supabase
			.from<SupabaseSubscription>('subscriptions')
			.select('*, prices(*, products(*))')
			.in('status', ['trialing', 'active', 'past_due'])
			.eq('cancel_at_period_end', false)
			.maybeSingle();
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
					setSubscription(sub.data);
					setUserLoaded(true);
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
		userLoaded,
		subscription,
		resetPassword: (email: string) =>
			supabase.auth.api.resetPasswordForEmail(email, {
				redirectTo: getURL(),
			}),
		signIn: (creds: UserCredentials) =>
			supabase.auth.signIn(creds, { redirectTo: getURL() }),
		signUp: (creds: UserCredentials, userMetadata: UserMetadata) =>
			supabase.auth.signUp(creds, {
				redirectTo: getURL(),
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
