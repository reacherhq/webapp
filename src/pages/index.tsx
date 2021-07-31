import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { Nav } from '../components';
import { StripeMananageButton } from '../components/StripeManageButton';
import { SubGetStarted } from '../components/SubGetStarted/';
import { sentryException } from '../util/sentry';
import {
	COMMERCIAL_LICENSE_PRODUCT_ID,
	productName,
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

interface IndexProps {
	products: SupabaseProductWithPrice[];
}

export default function Index({ products }: IndexProps): React.ReactElement {
	const router = useRouter();
	const { userDetails, userLoaded, user, subscription } = useUser();

	useEffect(() => {
		if (!user) router.replace('/signin').catch(sentryException);
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
				{userLoaded ? (
					<>
						<section className="section">
							<h2>Active Subscriptions</h2>
							<p>
								You are currently subscribed to the{' '}
								{productName(subscription?.prices?.products)}.
							</p>
							{subscription && (
								<p>
									<StripeMananageButton>
										Manage Subscription
									</StripeMananageButton>
									<StripeMananageButton>
										Billing History &amp; Invoices
									</StripeMananageButton>
								</p>
							)}
						</section>

						<SubGetStarted subscription={subscription} />

						<section className="section">
							<h2>Your Details</h2>
							<p>
								Please contact ✉️{' '}
								<a href="mailto:amaury@reacher.email">
									amaury@reacher.email
								</a>{' '}
								if you want to modify this information.
							</p>
							<div className="columns">
								<form className="column col-8 col-mx-auto">
									<div className="form-group">
										<label
											className="form-label"
											htmlFor="input-name"
										>
											Full name, or a display name you are
											comfortable with:
										</label>
										<input
											className="form-input"
											defaultValue={
												userDetails?.full_name
											}
											disabled
											id="input-name"
											placeholder="Name"
										/>
									</div>
									<div className="form-group">
										<label
											className="form-label"
											htmlFor="input-email"
										>
											Email address for login:
										</label>
										<input
											className="form-input"
											disabled
											id="input-email"
											placeholder="Email"
											defaultValue={user?.email}
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
