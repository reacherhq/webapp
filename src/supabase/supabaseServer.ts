// Copied from:
// https://github.com/vercel/nextjs-subscription-payments/blob/c7867b2d9e08d033056293d12aeb9825b8331806/app/supabase-server.ts
// License: MIT

import { ProductWithPrice } from "./domain.types";
import { supabaseAdmin } from "./supabaseAdmin";

export async function getSession() {
	const supabase = supabaseAdmin;
	const {
		data: { session },
		error,
	} = await supabase.auth.getSession();

	if (error) {
		throw error;
	}
	return session;
}

export async function getUserDetails() {
	const supabase = supabaseAdmin;
	const { data: userDetails, error } = await supabase
		.from("users")
		.select("*")
		.single();
	return userDetails;
	if (error) {
		throw error;
	}
}

export async function getSubscription() {
	const supabase = supabaseAdmin;
	const { data: subscription, error } = await supabase
		.from("subscriptions")
		.select("*, prices(*, products(*))")
		.in("status", ["trialing", "active"])
		.maybeSingle()
		.throwOnError();
	if (error) {
		throw error;
	}
	return subscription;
}

export const getActiveProductsWithPrices = async (): Promise<
	ProductWithPrice[]
> => {
	const supabase = supabaseAdmin;
	const { data, error } = await supabase
		.from("products")
		.select("*, prices(*)")
		.eq("active", true)
		.eq("prices.active", true)
		.order("metadata->index")
		.order("unit_amount", { foreignTable: "prices" });

	if (error) {
		throw error;
	}
	return data ?? [];
};
