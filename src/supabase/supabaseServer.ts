// Copied from:
// https://github.com/vercel/nextjs-subscription-payments/blob/c7867b2d9e08d033056293d12aeb9825b8331806/app/supabase-server.ts
// License: MIT

import { supabaseAdmin } from "./supabaseAdmin";

export async function getSession() {
	const supabase = supabaseAdmin;
	try {
		const {
			data: { session },
		} = await supabase.auth.getSession();
		return session;
	} catch (error) {
		console.error("Error:", error);
		return null;
	}
}

export async function getUserDetails() {
	const supabase = supabaseAdmin;
	try {
		const { data: userDetails } = await supabase
			.from("users")
			.select("*")
			.single();
		return userDetails;
	} catch (error) {
		console.error("Error:", error);
		return null;
	}
}

export async function getSubscription() {
	const supabase = supabaseAdmin;
	try {
		const { data: subscription } = await supabase
			.from("subscriptions")
			.select("*, prices(*, products(*))")
			.in("status", ["trialing", "active"])
			.maybeSingle()
			.throwOnError();
		return subscription;
	} catch (error) {
		console.error("Error:", error);
		return null;
	}
}

export const getActiveProductsWithPrices = async () => {
	const supabase = supabaseAdmin;
	const { data, error } = await supabase
		.from("products")
		.select("*, prices(*)")
		.eq("active", true)
		.eq("prices.active", true)
		.order("metadata->index")
		.order("unit_amount", { foreignTable: "prices" });

	if (error) {
		console.log(error.message);
	}
	return data ?? [];
};
