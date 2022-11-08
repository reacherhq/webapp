import { Link as GLink, Loading, Page, Spacer, Text } from '@geist-ui/react';
import React from 'react';

import { StripeMananageButton } from '../components/StripeManageButton';
import { SubGetStarted } from '../components/SubGetStarted/';
import {
	COMMERCIAL_LICENSE_PRODUCT_ID,
	productName,
	SAAS_10K_PRODUCT_ID,
} from '../util/subs';
import { SupabaseProductWithPrice } from '../util/supabaseClient';
import { useUser } from '../util/useUser';
import { ApiUsage } from './ApiUsage';
import styles from './Dashboard.module.css';

interface DashboardProps {
	products: SupabaseProductWithPrice[];
}

export function Dashboard({ products }: DashboardProps): React.ReactElement {
	const { userDetails, subscription, userFinishedLoading } = useUser();

	const saasProduct = products.find(({ id }) => id === SAAS_10K_PRODUCT_ID);
	const licenseProduct = products.find(
		({ id }) => id === COMMERCIAL_LICENSE_PRODUCT_ID
	);
	if (!saasProduct || !licenseProduct) {
		throw new Error('Dashboard: saasProduct or licenseProduct not found.');
	}

	if (!userFinishedLoading) {
		return (
			<Page>
				<Loading />
			</Page>
		);
	}

	return (
		<Page>
			<section className={styles.plan}>
				<div>
					<Spacer y={2} />
					<Text h2>Hello{userDetails?.full_name || ''},</Text>
					<Text p>
						Thanks for using the Reacher{' '}
						{productName(subscription?.prices?.products)}!<br />
						Below is how to get started with email verifications.
					</Text>
					<div className="flex">
						{subscription ? (
							<StripeMananageButton>
								Manage Subscription
							</StripeMananageButton>
						) : (
							<GLink
								color
								href="/pricing"
								data-sa-link-event="dashboard:upgrade:click"
							>
								<strong>Upgrade Plan</strong>
							</GLink>
						)}
						<Spacer />
						<StripeMananageButton>
							Billing History
						</StripeMananageButton>
					</div>
				</div>
				<div>
					<Text className="text-right" p>
						Active Subscription
					</Text>
					<Text className="text-right" h3>
						{productName(subscription?.prices?.products)}
					</Text>
				</div>
			</section>

			<Spacer y={3} />

			{subscription?.prices?.product_id !==
				COMMERCIAL_LICENSE_PRODUCT_ID && <ApiUsage />}

			<Spacer y={3} />

			<SubGetStarted subscription={subscription} />
		</Page>
	);
}
