import type {
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

import { sentryException } from './sentry';
import { supabase, SupabaseSubscription, SupabaseUser } from './supabaseClient';

interface UserContext {
	session: Session | null;
	signIn: (
		options: UserCredentials
	) => Promise<{
		session: Session | null;
		user: User | null;
		provider?: Provider;
		url?: string | null;
		error: Error | null;
	}>;
	signOut: () => Promise<void>;
	signUp: (
		options: UserCredentials
	) => Promise<{
		session: Session | null;
		user: User | null;
		provider?: Provider;
		url?: string | null;
		error: Error | null;
	}>;
	subscription: SupabaseSubscription | null;
	user: User | null;
	userDetails: SupabaseUser | null;
	userLoaded: boolean;
}

export const UserContext = createContext({} as UserContext);

export const UserContextProvider: FunctionComponent = (
	props
): React.ReactElement => {
	const [userLoaded, setUserLoaded] = useState(false);
	const [session, setSession] = useState<Session | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [userDetails, setUserDetails] = useState<SupabaseUser | null>(null);
	const [
		subscription,
		setSubscription,
	] = useState<SupabaseSubscription | null>(null);

	useEffect(() => {
		const session = supabase.auth.session();
		setSession(session);
		setUser(session?.user ?? null);
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
			.in('status', ['trialing', 'active'])
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
				})
				.catch(sentryException);
		}
	}, [user]);

	const value = {
		session,
		user,
		userDetails,
		userLoaded,
		subscription,
		signIn: (options: UserCredentials) => supabase.auth.signIn(options),
		signUp: (options: UserCredentials) => supabase.auth.signUp(options),
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
