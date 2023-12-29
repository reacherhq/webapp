import { dictionary } from "@/dictionaries";
import { SubscriptionWithPrice } from "@/supabase/supabaseServer";

// We're hardcoding these as env variables.
export const SAAS_10K_PRODUCT_ID = process.env.NEXT_PUBLIC_SAAS_10K_PRODUCT_ID;
export const SAAS_100K_PRODUCT_ID =
	process.env.NEXT_PUBLIC_SAAS_100K_PRODUCT_ID;
export const COMMERCIAL_LICENSE_PRODUCT_ID =
	process.env.NEXT_PUBLIC_COMMERCIAL_LICENSE_PRODUCT_ID;

if (!SAAS_10K_PRODUCT_ID || !COMMERCIAL_LICENSE_PRODUCT_ID) {
	throw new Error(
		"Both NEXT_PUBLIC_COMMERCIAL_LICENSE_PRODUCT_ID and NEXT_PUBLIC_SAAS_10K_PRODUCT_ID must be set as env variables."
	);
}

// Return the max monthly calls
export function subApiMaxCalls(sub: SubscriptionWithPrice | null): number {
	return sub?.prices?.product_id === SAAS_100K_PRODUCT_ID
		? 100_000
		: sub?.prices?.product_id === SAAS_10K_PRODUCT_ID
		? 10_000
		: 50;
}
