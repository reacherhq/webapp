"use client";

import { Grid, Select } from "@geist-ui/react";
import React, { useState } from "react";
import {
	COMMERCIAL_LICENSE_PRODUCT_ID,
	SAAS_100K_PRODUCT_ID,
	SAAS_10K_PRODUCT_ID,
} from "@/util/subs";
import { Dictionary } from "@/dictionaries";
import { SaaS10k } from "./SaaS10k";
import { SaaS100k } from "./SaaS100k";
import { Commercial } from "./Commercial";
import type {
	ProductWithPrice,
	SubscriptionWithPrice,
} from "@/supabase/supabaseServer";

interface PlansProps {
	d: Dictionary;
	isLoggedIn: boolean;
	products: ProductWithPrice[];
	subscription: SubscriptionWithPrice | null;
}

export function Plans({ d, products, subscription, isLoggedIn }: PlansProps) {
	const subscriptionCurrency = subscription?.prices?.currency;
	const [currency, setCurrency] = useState<string>(
		subscriptionCurrency || "eur"
	);

	const saas10kProduct = products.find(
		({ id }) => id === SAAS_10K_PRODUCT_ID
	);
	const saas100kProduct = products.find(
		({ id }) => id === SAAS_100K_PRODUCT_ID
	);
	const commercialProduct = products.find(
		({ id }) => id === COMMERCIAL_LICENSE_PRODUCT_ID
	);
	if (!saas10kProduct || !saas100kProduct || !commercialProduct) {
		throw new Error("Pricing: saasProduct or commercialProduct not found.");
	}

	return (
		<Grid.Container gap={2} justify="center">
			<Grid xs={18}></Grid>
			<Grid xs={6}>
				<Select
					width="auto"
					disabled={!!subscriptionCurrency} // Can't change currency if user already has a subscription
					onChange={(c) => setCurrency(c as string)}
					value={currency}
				>
					<Select.Option value="eur">EUR (€)</Select.Option>
					<Select.Option value="usd">USD ($)</Select.Option>
				</Select>
			</Grid>
			<Grid xs={20} sm={6}>
				<SaaS10k
					d={d}
					currency={currency}
					isLoggedIn={isLoggedIn}
					product={saas10kProduct}
					subscription={
						subscription?.prices?.product_id === SAAS_10K_PRODUCT_ID
							? subscription
							: null
					}
				/>
			</Grid>
			<Grid xs={20} sm={6}>
				<SaaS100k
					d={d}
					currency={currency}
					isLoggedIn={isLoggedIn}
					product={saas100kProduct}
					subscription={
						subscription?.prices?.product_id ===
						SAAS_100K_PRODUCT_ID
							? subscription
							: null
					}
				/>
			</Grid>
			<Grid xs={20} sm={6}>
				<Commercial
					d={d}
					currency={currency}
					isLoggedIn={isLoggedIn}
					product={commercialProduct}
					subscription={
						subscription?.prices?.product_id ===
						COMMERCIAL_LICENSE_PRODUCT_ID
							? subscription
							: null
					}
				/>
			</Grid>
		</Grid.Container>
	);
}
