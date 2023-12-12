import { Tables } from "@/supabase/database.types";
import { CheckEmailOutput } from "@reacherhq/api";
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { createClient, User } from "@supabase/supabase-js";
import { parseISO, subMonths } from "date-fns";

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

export interface SupabaseCustomer {
	id: string;
	stripe_customer_id: string;
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
	is_reachable: "safe" | "invalid" | "risky" | "unknown";
	verif_method?: string;
	result?: CheckEmailOutput; // JSON
}

export const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL as string,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function getActiveProductsWithPrices(): Promise<
	SupabaseProductWithPrice[]
> {
	const { data, error } = await supabase
		.from<SupabaseProductWithPrice>("products")
		.select("*, prices(*)")
		.eq("active", true)
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore Supabase typings error?
		.eq("prices.active", true)
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore Supabase typings error?
		.order("metadata->index")
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore Supabase typings error?
		.order("unit_amount", { foreignTable: "prices" });

	if (error) {
		throw error;
	}

	return data || [];
}

export function updateUserName(
	user: User,
	name: string
): PostgrestFilterBuilder<Tables<"users">> {
	return supabase
		.from<Tables<"users">>("users")
		.update({
			full_name: name,
		})
		.eq("id", user.id);
}

// Get the api calls of a user in the past month.
export async function getApiUsageClient(
	user: User,
	subscription: Tables<"subscriptions"> | undefined
): Promise<number> {
	const { error, count } = await supabase
		.from<SupabaseCall>("calls")
		.select("*", { count: "exact" })
		.eq("user_id", user.id)
		.gt("created_at", getUsageStartDate(subscription).toISOString());

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
	subscription: Tables<"subscriptions"> | undefined
): Date {
	if (!subscription) {
		return subMonths(new Date(), 1);
	}

	return typeof subscription.current_period_start === "string"
		? parseISO(subscription.current_period_start)
		: subscription.current_period_start;
}
