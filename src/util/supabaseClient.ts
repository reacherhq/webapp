import type { PostgrestFilterBuilder } from '@supabase/postgrest-js';
import { createClient, User } from '@supabase/supabase-js';
import { isDate, subMonths } from 'date-fns';

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
	cancel_at: Date | null;
	cancel_at_period_end: boolean;
	canceled_at: Date | null;
	created: Date;
	current_period_end: Date;
	current_period_start: Date;
	ended_at: Date | null;
	metadata: Record<string, string>;
	price_id: string;
	prices?: SupabasePrice; // Populated on join.
	quantity: string;
	status?: string;
	trial_end: Date | null;
	trial_start: Date | null;
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
}

export interface SupabaseCall {
	id: number;
	user_id: string;
	endpoint: string;
	created_at: string;
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
	const { count, error } = await supabase
		.from<SupabaseCall>('calls')
		.select('*', { count: 'exact' })
		.eq('user_id', user.id)
		.gt('created_at', getUsageStartDate(subscription).toUTCString());

	if (error) {
		throw error;
	}

	if (count === null) {
		throw new Error(
			`Got null count in getApiUsageClient for user ${user.id}.`
		);
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

	return isDate(subscription.current_period_start)
		? subscription.current_period_start
		: new Date(subscription.current_period_start);
}
