import { Button } from "@geist-ui/react";
import React, { useState } from "react";

import { postData } from "@/util/helpers";
import { sentryException } from "@/util/sentry";
import { getStripe } from "@/util/stripeClient";
import { COMMERCIAL_LICENSE_PRODUCT_ID } from "@/util/subs";
import { Card } from "./Card";
import { Tables } from "@/supabase/database.types";
import { Dictionary } from "@/dictionaries";
import { ProductWithPrice } from "@/supabase/supabaseServer";
import { DLink } from "@/components/DLink";

export interface ProductCardProps {
	d: Dictionary;
	ctaInFooter?: boolean;
	currency: string;
	isLoggedIn: boolean;
	product: ProductWithPrice;
	subscription: Tables<"subscriptions"> | null;
	extra?: React.ReactElement;
	header?: React.ReactElement;
	footer?: React.ReactElement;
	features?: React.ReactElement[];
	subtitle?: React.ReactElement;
	ctaLabel: string;
}

export function ProductCard({
	currency,
	isLoggedIn,
	product,
	subscription,
	ctaLabel,
	ctaInFooter,
	footer,
	...props
}: ProductCardProps): React.ReactElement {
	const [priceIdLoading, setPriceIdLoading] = useState<string | false>();
	const d = props.d.pricing;

	const active = !!subscription;
	// For the SAA10k and SaaS100k products, we also allow a yearly subscription.
	// This is currently not implemented in the UI, but the backend supports it.
	const price = product.prices.find(
		({ currency: c, interval }) => currency === c && interval === "month"
	);
	if (!price || !price.unit_amount) {
		return <p>Error: No price found for product {product.id}.</p>;
	}

	const handleCheckout = async (price: Tables<"prices">) => {
		setPriceIdLoading(price.id);

		if (!isLoggedIn) {
			return;
		}

		try {
			const { sessionId } = await postData<{ sessionId: string }>({
				url: "/api/stripe/create-checkout-session",
				data: { price, locale: props.d.lang },
			});

			const stripe = await getStripe();
			if (!stripe) {
				throw new Error("Empty stripe object at checkout");
			}

			await stripe.redirectToCheckout({
				sessionId,
			});
		} catch (err) {
			sentryException(err as Error);
			alert((err as Error).message);
		} finally {
			setPriceIdLoading(false);
		}
	};

	const priceString = new Intl.NumberFormat("en-US", {
		style: "currency",
		currency: price.currency || undefined,
		minimumFractionDigits: 0,
	}).format(price.unit_amount / 100);

	const ctaButton = (
		<Button
			className="full-width"
			disabled={!!priceIdLoading || active}
			onClick={() => {
				window.sa_event &&
					window.sa_event(
						`pricing_${
							product.id === COMMERCIAL_LICENSE_PRODUCT_ID
								? "commercial"
								: "saas10k"
						}`
					);
				handleCheckout(price).catch(sentryException);
			}}
			type="success"
		>
			{priceIdLoading
				? isLoggedIn
					? d.cards.redirecting_to_stripe
					: d.cards.redirecting_to_signup
				: active
				? d.cards.current_plan
				: isLoggedIn
				? d.cards.select_plan_cta
				: ctaLabel}
		</Button>
	);

	return (
		<Card
			cta={
				isLoggedIn ? (
					ctaButton
				) : (
					<DLink d={props.d} href="/signup" className="full-width">
						{ctaButton}
					</DLink>
				)
			}
			key={price.product_id}
			price={priceString}
			title={
				d.plans[product.name as keyof typeof d.plans] ||
				product.name ||
				"No Product"
			} // The latter should never happen
			footer={footer ? footer : ctaInFooter ? ctaButton : undefined}
			{...props}
		/>
	);
}
