import { isBefore } from "date-fns";

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
export function subApiMaxCalls(
	productId: string | null | undefined,
	userId: string | null
): number {
	const today = new Date();
	const julySeventh = new Date(today.getFullYear(), 6, 7); // Months are 0-indexed, so 6 is July

	// TODO: This is extremely hard-coded, and should be refactored to something
	// inside the DB, with an admin dashboard to update etc. But for now, let's
	// do like this.
	if (
		(userId === "fe601de1-adc5-442f-a1b3-b58a01503474" ||
			userId === "350c4640-42b3-4596-89fd-cacfd81e2b8a") &&
		isBefore(today, julySeventh)
	) {
		return 20_000;
	}

	return productId === SAAS_100K_PRODUCT_ID
		? 100_000
		: productId === SAAS_10K_PRODUCT_ID
		? 10_000
		: 3;
}
