import type { SupabaseProduct } from "./supabaseClient";
import { SubscriptionWithPrice } from "@/supabase/domain.types";

// We're hardcoding these as env variables.
export const SAAS_10K_PRODUCT_ID = process.env.NEXT_PUBLIC_SAAS_10K_PRODUCT_ID;
export const COMMERCIAL_LICENSE_PRODUCT_ID =
	process.env.NEXT_PUBLIC_COMMERCIAL_LICENSE_PRODUCT_ID;

if (!SAAS_10K_PRODUCT_ID || !COMMERCIAL_LICENSE_PRODUCT_ID) {
	throw new Error(
		"Both NEXT_PUBLIC_COMMERCIAL_LICENSE_PRODUCT_ID and NEXT_PUBLIC_SAAS_10K_PRODUCT_ID must be set as env variables."
	);
}

// Get the user-friendly name of a product.
export function productName(product?: SupabaseProduct): string {
	return product?.name || "Free Trial";
}

// Return the max monthly calls
export function subApiMaxCalls(sub: SubscriptionWithPrice | undefined): number {
	return sub?.prices?.products?.id === SAAS_10K_PRODUCT_ID ? 10000 : 50;
}
