import { Grid, Select, Spacer, Text } from "@geist-ui/react";
import { GetStaticProps } from "next";
import React, { useState } from "react";

import { FreeTrial, Nav, ProductCard } from "../components";
import {
	COMMERCIAL_LICENSE_PRODUCT_ID,
	SAAS_10K_PRODUCT_ID,
} from "../util/subs";
import {
	getActiveProductsWithPrices,
	SupabaseProductWithPrice,
} from "../util/supabaseClient";
import { useUser } from "../util/useUser";

export const getStaticProps: GetStaticProps = async () => {
	const products = await getActiveProductsWithPrices();

	return {
		props: {
			products,
		},
	};
};

interface PricingProps {
	products: SupabaseProductWithPrice[];
}

export default function Pricing({
	products,
}: PricingProps): React.ReactElement {
	const { subscription } = useUser();
	const subscriptionCurrency = subscription?.prices?.currency;
	const [currency, setCurrency] = useState<string>(
		subscriptionCurrency || "eur"
	);

	const saasProduct = products.find(({ id }) => id === SAAS_10K_PRODUCT_ID);
	const licenseProduct = products.find(
		({ id }) => id === COMMERCIAL_LICENSE_PRODUCT_ID
	);
	if (!saasProduct || !licenseProduct) {
		throw new Error("Pricing: saasProduct or licenseProduct not found.");
	}

	return (
		<>
			<Nav />
			<Spacer y={5} />
			<Text className="text-center" h2>
				Pricing
			</Text>

			<Spacer y={2} />
			<section>
				<Grid.Container gap={2} justify="center">
					<Grid xs={18}></Grid>
					<Grid xs={6}>
						<Select
							width="auto"
							disabled={!!subscriptionCurrency} // Can't change currency if user already has a subscription
							onChange={(c) => setCurrency(c as string)}
							value={currency}
						>
							<Select.Option value="eur">EUR</Select.Option>
							<Select.Option value="usd">USD</Select.Option>
						</Select>
					</Grid>
					<Grid xs={20} sm={6}>
						<FreeTrial active={!subscription} currency={currency} />
					</Grid>
					<Grid xs={20} sm={6}>
						<ProductCard
							currency={currency}
							product={saasProduct}
							subscription={
								subscription?.prices?.product_id ===
								SAAS_10K_PRODUCT_ID
									? subscription
									: null
							}
						/>
					</Grid>
					<Grid xs={20} sm={6}>
						<ProductCard
							currency={currency}
							product={licenseProduct}
							subscription={
								subscription?.prices?.product_id ===
								COMMERCIAL_LICENSE_PRODUCT_ID
									? subscription
									: null
							}
						/>
					</Grid>
				</Grid.Container>
			</section>
		</>
	);
}
