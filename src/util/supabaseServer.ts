import { createClient, User } from '@supabase/supabase-js';

import {
	SupabaseCall,
	SupabaseSubscription,
	SupabaseUser,
} from './supabaseClient';

export const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL as string,
	process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export const getUser = async (jwt: string): Promise<User | null> => {
	const { data, error } = await supabaseAdmin.auth.api.getUser(jwt);

	if (error) {
		throw error;
	}

	return data;
};

export const getUserByApiToken = async (
	apiToken: string
): Promise<SupabaseUser | null> => {
	const { data, error } = await supabaseAdmin
		.from<SupabaseUser>('users')
		.select('*')
		.eq('api_token', apiToken)
		.maybeSingle();

	if (error) {
		throw error;
	}

	return data;
};

export async function getActiveSubscription(
	user: User
): Promise<SupabaseSubscription | null> {
	const { data, error } = await supabaseAdmin
		.from<SupabaseSubscription>('subscriptions')
		.select('*, prices(*, products(*))')
		.in('status', ['trialing', 'active', 'past_due'])
		.eq('cancel_at_period_end', false)
		.eq('user_id', user.id)
		.maybeSingle();

	if (error) throw error;

	return data;
}

// Get the api calls of a user in the past month. Same as
// `getApiUsageClient`, but for server usage.
export async function getApiUsageServer(user: SupabaseUser): Promise<number> {
	const oneMonthAgo = new Date();
	oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
	const { data, error } = await supabaseAdmin
		.from<SupabaseCall>('calls')
		.select('*')
		.eq('user_id', user.id)
		.gt('created_at', oneMonthAgo.toUTCString());

	if (error) {
		throw error;
	}

	return data?.length || 0;
}
