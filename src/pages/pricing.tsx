import { Collapse, Grid, Page, Select, Spacer, Text } from "@geist-ui/react";
import { GetStaticProps } from "next";
import React, { useState } from "react";

import { Nav } from "../components/Nav";
import { SaaS10k, SaaS100k, Commercial } from "../components/ProductCard";
import {
	COMMERCIAL_LICENSE_PRODUCT_ID,
	SAAS_100K_PRODUCT_ID,
	SAAS_10K_PRODUCT_ID,
} from "@/util/subs";
import { getActiveProductWithPrices } from "@/util/supabaseClient";
import { useUser } from "@/util/useUser";
import { ProductWithPrice } from "@/supabase/domain.types";

export const getStaticProps: GetStaticProps = async () => {
	const products = await getActiveProductWithPrices();

	return {
		props: {
			products,
		},
	};
};

interface PricingProps {
	products: ProductWithPrice[];
}

export default function Pricing({
	products,
}: PricingProps): React.ReactElement {
	const { subscription } = useUser();
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
		<>
			<Nav />
			<Spacer y={5} />
			<Text className="text-center" h2>
				Pricing
			</Text>
			<Text p em className="text-center">
				All plans include a 30-day money back guarantee.
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
							<Select.Option value="eur">EUR (€)</Select.Option>
							<Select.Option value="usd">USD ($)</Select.Option>
						</Select>
					</Grid>
					<Grid xs={20} sm={6}>
						<SaaS10k
							currency={currency}
							product={saas10kProduct}
							subscription={
								subscription?.prices?.product_id ===
								SAAS_10K_PRODUCT_ID
									? subscription
									: null
							}
						/>
					</Grid>
					<Grid xs={20} sm={6}>
						<SaaS100k
							currency={currency}
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
							currency={currency}
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

				<Spacer y={2} />
				<Page>
					<Text className="text-center" h2>
						Frequently Asked Questions
					</Text>
					<Spacer y={2} />
					<Collapse.Group>
						<Collapse
							title="Can I verify 1 million (or more) emails?"
							initialVisible
						>
							If you need to verify 200K, 500K, or 1+ million
							emails, please check the{" "}
							<strong>Commercial License Plan</strong>. You will
							need to purchase your own servers separately and
							self-host Reacher.
						</Collapse>
						<Collapse title="Can I get a refund?">
							Sure. If you use Reacher and find that the
							verifications are slow or incorrect, I&apos;ll
							refund you the full amount if you email me ✉️{" "}
							<a href="mailto:amaury@reacher.email">
								amaury@reacher.email
							</a>{" "}
							within 30 days of your subscription.
						</Collapse>
						<Collapse title="Can I get a free trial?">
							<p>
								If you are interested in the SaaS 10K or 100K
								plans, then no, Reacher does not offer any free
								trial. There is however a 30-day money back
								guarantee.
							</p>

							<p>
								If you are interested in the Commercial License,
								you can follow these steps in the{" "}
								<a
									href="https://help.reacher.email/self-host-guide#2a0e764e7cb94933b81c967be334dffd"
									target="_blank"
									rel="noopener noreferrer"
								>
									self-host guide
								</a>{" "}
								for a free trial .
							</p>
						</Collapse>
						<Collapse title="Another question?">
							Send me an email to{" "}
							<a href="mailto:amaury@reacher.email">
								📧 amaury@reacher.email
							</a>
							, I reply pretty fast.
						</Collapse>
					</Collapse.Group>
				</Page>
			</section>
		</>
	);
}
