import { Tables } from "@/supabase/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { parseISO, subMonths } from "date-fns";

// We're hardcoding these as env variables.
export const SAAS_10K_PRODUCT_ID = process.env.NEXT_PUBLIC_SAAS_10K_PRODUCT_ID;
export const SAAS_100K_PRODUCT_ID =
	process.env.NEXT_PUBLIC_SAAS_100K_PRODUCT_ID;
export const COMMERCIAL_LICENSE_PRODUCT_ID =
	process.env.NEXT_PUBLIC_COMMERCIAL_LICENSE_PRODUCT_ID;

if (
	!SAAS_10K_PRODUCT_ID ||
	!SAAS_100K_PRODUCT_ID ||
	!COMMERCIAL_LICENSE_PRODUCT_ID
) {
	throw new Error("Check the Stripe product ID env variables");
}

// Return the max monthly calls
export function subApiMaxCalls(productId: string | null | undefined): number {
	return productId === SAAS_100K_PRODUCT_ID
		? 100_000
		: productId === SAAS_10K_PRODUCT_ID
		? 10_000
		: 3;
}

// Get the api calls of a user in the past month/billing period.
export async function getApiUsage(
	supabase: SupabaseClient,
	subscription: Tables<"subscriptions"> | null
): Promise<number> {
	const { error, count } = await supabase
		.from("calls")
		.select("*", { count: "exact" })
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
function getUsageStartDate(subscription: Tables<"subscriptions"> | null): Date {
	if (!subscription) {
		return subMonths(new Date(), 1);
	}

	return parseISO(subscription.current_period_start);
}
