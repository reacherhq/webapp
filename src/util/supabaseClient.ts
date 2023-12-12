import { Tables } from "@/supabase/database.types";
import { ProductWithPrice } from "@/supabase/domain.types";
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js";
import { createClient, User } from "@supabase/supabase-js";
import { parseISO, subMonths } from "date-fns";

export const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL as string,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
);

export async function getActiveProductWithPrices(): Promise<
	ProductWithPrice[]
> {
	const { data, error } = await supabase
		.from<ProductWithPrice>("products")
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
	subscription: Tables<"subscriptions"> | null
): Promise<number> {
	const { error, count } = await supabase
		.from<Tables<"calls">>("calls")
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
export function getUsageStartDate(
	subscription: Tables<"subscriptions"> | null
): Date {
	if (!subscription) {
		return subMonths(new Date(), 1);
	}

	return typeof subscription.current_period_start === "string"
		? parseISO(subscription.current_period_start)
		: subscription.current_period_start;
}
