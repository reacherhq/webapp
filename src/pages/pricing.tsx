import { Collapse, Grid, Page, Select, Spacer, Text } from "@geist-ui/react";
import { GetStaticProps } from "next";
import React, { useState } from "react";
import { SaaS10k, SaaS100k, Commercial } from "../components/Pricing";
import {
	COMMERCIAL_LICENSE_PRODUCT_ID,
	SAAS_100K_PRODUCT_ID,
	SAAS_10K_PRODUCT_ID,
} from "@/util/subs";
import { useUser } from "@/util/useUser";
import { ProductWithPrice } from "@/supabase/domain.types";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";
import Markdown from "marked-react";
import { getActiveProductsWithPrices } from "@/supabase/supabaseServer";

export const getStaticProps: GetStaticProps = async () => {
	const products = await getActiveProductsWithPrices();

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
	const router = useRouter();
	const d = dictionary(router.locale).pricing;

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
			<Spacer h={5} />
			<Text className="text-center" h2>
				{d.title}
			</Text>
			<Text p em className="text-center">
				{d["30d_money_back"]}
			</Text>

			<Spacer h={2} />
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

				<Spacer h={2} />
				<Page>
					<Text className="text-center" h2>
						{d.faq.title}
					</Text>
					<Spacer h={2} />
					<Collapse.Group>
						<Collapse
							title={d.faq.verify_1m_emails_q}
							initialVisible
						>
							<Markdown>{d.faq.verify_1m_emails_a}</Markdown>
						</Collapse>
						<Collapse title={d.faq.refund_q}>
							<Markdown>{d.faq.refund_a}</Markdown>
						</Collapse>
						<Collapse title={d.faq.free_trial_q}>
							<Markdown>{d.faq.free_trial_a}</Markdown>
						</Collapse>
						<Collapse title={d.faq.another_q}>
							<Markdown>{d.faq.another_a}</Markdown>
						</Collapse>
					</Collapse.Group>
				</Page>
			</section>
		</>
	);
}
