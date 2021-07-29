import { createClient, User } from '@supabase/supabase-js';

import { SupabaseSubscription } from './supabaseClient';

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

export async function getActiveSubscription(
	user: User
): Promise<SupabaseSubscription | null> {
	const { data, error } = await supabaseAdmin
		.from<SupabaseSubscription>('subscriptions')
		.select('*, prices(*, products(*))')
		.in('status', ['trialing', 'active'])
		.eq('cancel_at_period_end', false)
		.eq('user_id', user.id)
		.maybeSingle();

	if (error) throw error;

	return data;
}
