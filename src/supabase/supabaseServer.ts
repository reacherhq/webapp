// Copied from:
// https://github.com/vercel/nextjs-subscription-payments/blob/c7867b2d9e08d033056293d12aeb9825b8331806/app/supabase-server.ts
// License: MIT

import { cookies } from "next/headers";
import { createClient } from "./server";

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

export async function getUserDetails() {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);
	const { data: userDetails } = await supabase
		.from("users")
		.select("*")
		.single();
	return userDetails;
}

export type SubscriptionWithPrice = Awaited<ReturnType<typeof getSubscription>>;
export async function getSubscription() {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);
	const { data: subscription } = await supabase
		.from("subscriptions")
		.select("*, prices(*, products(*))")
		.in("status", ["trialing", "active"])
		.maybeSingle()
		.throwOnError();
	return subscription;
}

type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

export type ProductWithPrice = ArrayElement<
	Awaited<ReturnType<typeof getActiveProductsWithPrices>>
> & { id: string };
export const getActiveProductsWithPrices = async () => {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);
	const { data } = await supabase
		.from("products")
		.select("*, prices(*)")
		.eq("active", true)
		.eq("prices.active", true)
		.order("metadata->index")
		.order("unit_amount", { foreignTable: "prices" })
		.throwOnError();
	return data ?? [];
};
