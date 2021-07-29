import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { Nav, ProductCard } from '../components';
import { SubGetStarted, subscriptionName } from '../components/SubGetStarted';
import { sentryException } from '../util/sentry';
import {
	getActiveProductsWithPrices,
	SupabaseProductWithPrice,
	SupabaseSubscription,
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

interface IndexProps {
	products: SupabaseProductWithPrice[];
}

export default function Index({ products }: IndexProps): React.ReactElement {
	const router = useRouter();
	const { userLoaded, user, subscription } = useUser();
	const [getStarted, setGetStarted] = useState<SupabaseSubscription | null>(
		subscription
	);

	useEffect(() => {
		if (!user) router.replace('/signin').catch(sentryException);
	}, [router, user]);

	return (
		<>
			<Nav />
			<div className="thin-container">
				{userLoaded ? (
					<>
						<section className="section">
							<h2>Active Subscriptions</h2>
							<p>
								You are currently subscribed to the{' '}
								{subscriptionName(
									subscription?.prices?.products
								)}
								.
							</p>
							<div className="columns">
								{products.map((product) => (
									<ProductCard
										key={product.id}
										product={product}
										subscription={
											subscription?.prices?.product_id ===
											product.id
												? subscription
												: null
										}
									/>
								))}
							</div>
						</section>

						<SubGetStarted subscription={getStarted} />

						<section className="section">
							<h2>Your Details</h2>
							<div className="columns">
								<form className="column col-8 col-mx-auto">
									<div className="form-group">
										<label
											className="form-label"
											htmlFor="input-name"
										>
											Please enter your full name, or a
											display name you are comfortable
											with.
										</label>
										<input
											className="form-input"
											id="input-name"
											placeholder="Name"
										/>
									</div>
									<div className="form-group">
										<label
											className="form-label"
											htmlFor="input-email"
										>
											Please enter the email address you
											want to use to login.
											<br /> We will email you to verify
											the change.
										</label>
										<input
											className="form-input"
											id="input-email"
											placeholder="Email"
											value={user?.email}
										/>
									</div>
								</form>
							</div>
						</section>
					</>
				) : (
					<p>Loading...</p>
				)}
			</div>
		</>
	);
}
