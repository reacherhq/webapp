import { Button } from "@geist-ui/react";
import { useRouter } from "next/router";
import React, { useState } from "react";

import { postData } from "@/util/helpers";
import { sentryException } from "@/util/sentry";
import { getStripe } from "@/util/stripeClient";
import { COMMERCIAL_LICENSE_PRODUCT_ID } from "@/util/subs";
import type {} from "@/util/supabaseClient";
import { useUser } from "@/util/useUser";
import { Card } from "./Card";
import { Tables } from "@/supabase/database.types";
import { ProductWithPrice } from "@/supabase/domain.types";
import { dictionary } from "@/dictionaries";

export interface ProductCardProps {
	currency: string;
	product: ProductWithPrice;
	subscription: Tables<"subscriptions"> | null;
	extra?: React.ReactElement;
	header?: React.ReactElement;
	footer?: React.ReactElement;
	features?: (string | React.ReactElement)[];
	subtitle?: React.ReactElement;
}

export function ProductCard({
	currency,
	product,
	subscription,
	...props
}: ProductCardProps): React.ReactElement {
	const router = useRouter();
	const [priceIdLoading, setPriceIdLoading] = useState<string | false>();
	const { user, userLoaded } = useUser();
	const d = dictionary(router.locale).pricing;

	const active = !!subscription;
	const price = product.prices.find(({ currency: c }) => currency === c);
	if (!price || !price.unit_amount) {
		return <p>Error: No price found for product {product.id}.</p>;
	}

	const handleCheckout = async (price: Tables<"prices">) => {
		setPriceIdLoading(price.id);

		if (userLoaded && !user) {
			router.push("/signup").catch(sentryException);

			return;
		}

		try {
			const { sessionId } = await postData<{ sessionId: string }>({
				url: "/api/stripe/create-checkout-session",
				data: { price, locale: router.locale },
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

	return (
		<Card
			cta={
				<Button
					className="full-width"
					disabled={!!priceIdLoading || active}
					onClick={() => {
						window.sa_event &&
							window.sa_event(
								`pricing:${
									product.id === COMMERCIAL_LICENSE_PRODUCT_ID
										? "commercial"
										: "saas"
								}`
							);
						handleCheckout(price).catch(sentryException);
					}}
					type="success"
				>
					{priceIdLoading
						? user
							? d.cards.redirecting_to_stripe
							: d.cards.redirecting_to_signup
						: active
						? d.cards.current_plan
						: user
						? d.cards.select_plan_cta
						: d.cards.get_started}
				</Button>
			}
			key={price.product_id}
			price={priceString}
			title={
				d.plans[product.name as keyof typeof d.plans] ||
				product.name ||
				"No Product"
			} // The latter should never happen
			{...props}
		/>
	);
}
