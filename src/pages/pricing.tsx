import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { FreeTrial, Nav, ProductCard } from '../components';
import { sentryException } from '../util/sentry';
import {
	COMMERCIAL_LICENSE_PRODUCT_ID,
	SAAS_10K_PRODUCT_ID,
} from '../util/subs';
import {
	getActiveProductsWithPrices,
	SupabaseProductWithPrice,
} from '../util/supabaseClient';
import { useUser } from '../util/useUser';

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
	const router = useRouter();
	const { user, subscription } = useUser();
	const subscriptionCurrency = subscription?.prices?.currency;
	const [currency, setCurrency] = useState<string>(
		subscriptionCurrency || 'eur'
	);

	useEffect(() => {
		if (!user) router.replace('/login').catch(sentryException);
	}, [router, user]);

	const saasProduct = products.find(({ id }) => id === SAAS_10K_PRODUCT_ID);
	const licenseProduct = products.find(
		({ id }) => id === COMMERCIAL_LICENSE_PRODUCT_ID
	);
	if (!saasProduct || !licenseProduct) {
		throw new Error('Index: saasProduct or licenseProduct not found.');
	}

	return (
		<>
			<Nav />
			<div className="thin-container">
				<>
					<section className="section">
						<h1>Pricing Plans</h1>
						<select
							disabled={!!subscriptionCurrency} // Can't change currency if user already has a subscription
							onChange={({ target }) => setCurrency(target.value)}
							value={currency}
						>
							<option value="eur">EUR</option>
							<option value="usd">USD</option>
						</select>
						<div className="columns">
							<FreeTrial active={!subscription} />
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
						</div>
					</section>
				</>
			</div>
		</>
	);
}
