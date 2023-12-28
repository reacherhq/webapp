import { Tables } from "@/supabase/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { parseISO, subMonths } from "date-fns";

// Get the api calls of a user in the past month.
export async function getApiUsageClient(
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

	return typeof subscription.current_period_start === "string"
		? parseISO(subscription.current_period_start)
		: subscription.current_period_start;
}
