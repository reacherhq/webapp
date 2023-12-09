import { loadStripe, Stripe as StripeJS } from "@stripe/stripe-js";

let stripePromise: Promise<StripeJS | null> | undefined;

export const getStripe = (): Promise<StripeJS | null> => {
	if (!stripePromise) {
		stripePromise = loadStripe(
			process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY_LIVE as string
		);
	}

	return stripePromise;
};
