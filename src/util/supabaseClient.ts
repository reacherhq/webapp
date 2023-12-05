import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { createClient, User } from '@supabase/supabase-js';
import { parseISO, subMonths } from 'date-fns';

export interface SupabasePrice {
	active: boolean;
	currency: string;
	description: string | null;
	id: string;
	interval: string | null;
	interval_count: number | null;
	metadata: Record<string, string>;
	product_id: string;
	products?: SupabaseProduct; // Populated on join.
	trial_period_days?: number | null;
	type: string;
	unit_amount: number | null;
}

export interface SupabaseProduct {
	active: boolean;
	description: string | null;
	id: string;
	image?: string | null;
	metadata: Record<string, string>;
	name: string;
	prices?: SupabasePrice[]; // Populated on join.
}

export interface SupabaseProductWithPrice extends SupabaseProduct {
	prices: SupabasePrice[];
}

export interface SupabaseSubscription {
	id: string;
	cancel_at: string | Date | null;
	cancel_at_period_end: boolean;
	canceled_at: string | Date | null;
	created: string | Date;
	current_period_end: string | Date;
	current_period_start: string | Date;
	ended_at: string | Date | null;
	metadata: Record<string, string>;
	price_id: string;
	prices?: SupabasePrice; // Populated on join.
	quantity: string;
	status?: string;
	trial_end: string | Date | null;
	trial_start: string | Date | null;
	user_id: string;
}

export interface SupabaseCustomer {
	id: string;
	stripe_customer_id: string;
}

export interface SupabaseUser {
	full_name?: string;
	id: string;
	api_token: string;
	sendinblue_contact_id?: string;
}

export interface SupabaseCall {
	id: number;
	user_id: string;
	endpoint: string;
	created_at: string;
	duration?: number;
	backend?: string;
	backend_ip: string;
	domain?: string;
	verification_id: string;
	is_reachable: 'safe' | 'invalid' | 'risky' | 'unknown';
	verif_method?: string;
}

export const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL as string,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function getActiveProductsWithPrices(): Promise<
	SupabaseProductWithPrice[]
> {
	const { data, error } = await supabase
		.from<SupabaseProductWithPrice>('products')
		.select('*, prices(*)')
		.eq('active', true)
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore Supabase typings error?
		.eq('prices.active', true)
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore Supabase typings error?
		.order('metadata->index')
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore Supabase typings error?
		.order('unit_amount', { foreignTable: 'prices' });

	if (error) {
		throw error;
	}

	return data || [];
}

export function updateUserName(
	user: User,
	name: string
): PostgrestFilterBuilder<SupabaseUser> {
	return supabase
		.from<SupabaseUser>('users')
		.update({
			full_name: name,
		})
		.eq('id', user.id);
}

// Get the api calls of a user in the past month. Same as
// `getApiUsageServer`, but for client usage.
export async function getApiUsageClient(
	user: User,
	subscription: SupabaseSubscription | null | undefined
): Promise<number> {
	// Supabase-js doesn't allow for GROUP BY yet, so we fetch all
	// calls to backend1 (our 1st backend). All calls to other backends are
	// free.
	// TODO Switch to use verification_id once GROUP BY is implemented.
	const { error, count } = await supabase
		.from<SupabaseCall>('calls')
		.select('*', { count: 'exact' })
		.eq('user_id', user.id)
		.eq('backend', process.env.NEXT_PUBLIC_RCH_BACKEND_1)
		.gt('created_at', getUsageStartDate(subscription).toISOString());

	if (error) {
		throw error;
	}

	return count || 0;
}

// Returns the start date of the usage metering.
// - If the user has an active subscription, it's the current period's start
//   date.
// - If not, then it's 1 month rolling.
export function getUsageStartDate(
	subscription: SupabaseSubscription | null | undefined
): Date {
	if (!subscription) {
		return subMonths(new Date(), 1);
	}

	return typeof subscription.current_period_start === 'string'
		? parseISO(subscription.current_period_start)
		: subscription.current_period_start;
}
