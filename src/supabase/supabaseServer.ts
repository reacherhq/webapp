// Copied from:
// https://github.com/vercel/nextjs-subscription-payments/blob/c7867b2d9e08d033056293d12aeb9825b8331806/app/supabase-server.ts
// License: MIT

import { cookies } from "next/headers";
import { createClient } from "./server";
import { Tables } from "./database.types";

export async function getSession() {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	if (error) {
		throw error;
	}
	return session;
}

export type UserDetails = Awaited<ReturnType<typeof getUserDetails>>;

export async function getUserDetails() {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);
	const { data: userDetails, error } = await supabase
		.from("users")
		.select("*")
		.single();
	if (error) throw error;
	return userDetails;
}

export interface SubscriptionWithPrice extends Tables<"subscriptions"> {
	prices: Tables<"prices">;
}

export async function getSubscription() {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);

	const { data, error } = await supabase
		.from("subscriptions")
		.select("*, prices(*)")
		.in("status", ["trialing", "active"])
		.order("current_period_start", { ascending: false })
		.limit(1);
	if (error) throw error;

	return data[0] as SubscriptionWithPrice;
}

export interface ProductWithPrice extends Tables<"products"> {
	prices: Tables<"prices">[];
}

export const getActiveProductsWithPrices = async () => {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);
	const { data, error } = await supabase
		.from("products")
		.select("*, prices(*)")
		.eq("active", true)
		.eq("prices.active", true)
		.order("metadata->index")
		.order("unit_amount", { referencedTable: "prices", ascending: false });
	if (error) throw error;
	return (data as unknown as ProductWithPrice[]) ?? [];
};

// Get the api calls of a user in the past month/billing period.
// Once we upgrade to postgres 15, we can use the security_invoker = true
// and skip the userId here.
export async function getSubAndCalls(
	userId: string
): Promise<Tables<"sub_and_calls">> {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);

	const { data, error } = await supabase
		.from("sub_and_calls")
		.select("*")
		.eq("user_id", userId);
	if (error) {
		throw error;
	}

	if (!data[0]) {
		throw new Error(
			`No sub_and_calls found for user ${
				(await supabase.auth.getUser()).data.user?.id
			}.`
		);
	}

	return data[0];
}
