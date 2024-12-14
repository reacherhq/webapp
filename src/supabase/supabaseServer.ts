// Copied from:
// https://github.com/vercel/nextjs-subscription-payments/blob/c7867b2d9e08d033056293d12aeb9825b8331806/app/supabase-server.ts
// License: MIT

import { cookies } from "next/headers";
import { createClient } from "./server";
import { Tables } from "./database.types";
import { User } from "@supabase/supabase-js";

/**
 * Gets the currently authenticated Supabase user.
 *
 * @returns Promise resolving to the authenticated user response
 * @throws Error if no user is found or if there's an authentication error
 */
export async function getSupabaseUser(): Promise<User> {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);
	const {
		data: { user },
		error,
	} = await supabase.auth.getUser();

	// Handle auth errors
	if (error) {
		throw error;
	}
	// Ensure user exists
	if (!user) {
		throw new Error("No user found.");
	}

	return user;
}

/**
 * Gets the current Supabase session
 * @returns Promise resolving to the current session or null if not authenticated
 * @throws Error if there's an authentication error
 */
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

/**
 * Type alias for the return type of getUserDetails function
 */
export type UserDetails = Awaited<ReturnType<typeof getUserDetails>>;

/**
 * Gets the details of the currently authenticated user from the users table
 * @returns Promise resolving to the user details
 * @throws Error if no user is found or if there's a database error
 */
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

/**
 * Interface extending the subscriptions table type to include the associated price
 */
export interface SubscriptionWithPrice extends Tables<"subscriptions"> {
	prices: Tables<"prices">;
}

/**
 * Gets the active subscription for the current user
 * @returns Promise resolving to the subscription with price details, or undefined if no active subscription
 * @throws Error if there's a database error
 */
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

/**
 * Interface extending the products table type to include associated prices
 */
export interface ProductWithPrice extends Tables<"products"> {
	prices: Tables<"prices">[];
}

/**
 * Gets all active products with their associated prices
 * @returns Promise resolving to array of products with prices
 * @throws Error if there's a database error
 */
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

/**
 * Gets the API call usage statistics for a user in their current billing period
 * @param userId - The ID of the user to get stats for
 * @returns Promise resolving to the subscription and calls statistics
 * @throws Error if no stats found or if there's a database error
 */
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
