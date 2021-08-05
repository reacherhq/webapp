import { Button } from '@geist-ui/react';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { postData } from '../../util/helpers';
import { sentryException } from '../../util/sentry';
import { getStripe } from '../../util/stripeClient';
import { COMMERCIAL_LICENSE_PRODUCT_ID } from '../../util/subs';
import type {
	SupabasePrice,
	SupabaseProductWithPrice,
	SupabaseSubscription,
} from '../../util/supabaseClient';
import { useUser } from '../../util/useUser';
import { Card } from '../Card';
import { StripeMananageButton } from '../StripeManageButton';

export interface ProductCardProps {
	currency: string;
	product: SupabaseProductWithPrice;
	subscription: SupabaseSubscription | null;
}

export function ProductCard({
	currency,
	product,
	subscription,
}: ProductCardProps): React.ReactElement {
	const router = useRouter();
	const [priceIdLoading, setPriceIdLoading] = useState<string | false>();
	const { session } = useUser();

	const active = !!subscription;
	const price = product.prices.find(({ currency: c }) => currency === c);
	if (!price || !price.unit_amount) {
		return <p>Error: No price found for product {product.id}.</p>;
	}

	const handleCheckout = async (price: SupabasePrice) => {
		setPriceIdLoading(price.id);

		if (!session) {
			return router.push('/login');
		}

		try {
			const { sessionId } = await postData<{ sessionId: string }>({
				url: '/api/stripe/create-checkout-session',
				data: { price },
				token: session.access_token,
			});

			const stripe = await getStripe();
			if (!stripe) {
				throw new Error('Empty stripe object at checkout');
			}

			await stripe.redirectToCheckout({ sessionId });
		} catch (err) {
			sentryException(err);
			alert((err as Error).message);
		} finally {
			setPriceIdLoading(false);
		}
	};

	const priceString = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: price.currency,
		minimumFractionDigits: 0,
	}).format(price.unit_amount / 100);

	return (
		<Card
			body={
				product.id === COMMERCIAL_LICENSE_PRODUCT_ID
					? licenseFeatures()
					: saasFeatures()
			}
			footer={
				active ? (
					<>
						<StripeMananageButton>
							Cancel Subscription
						</StripeMananageButton>
						<StripeMananageButton>
							Billing History &amp; Invoices
						</StripeMananageButton>
					</>
				) : undefined
			}
			key={price.product_id}
			subtitle={
				<>
					<p>
						{priceString}/month.{' '}
						{subscription?.cancel_at_period_end &&
							subscription.cancel_at &&
							` Ends at ${
								subscription.cancel_at
									.toLocaleString()
									.split('T')[0]
							}.`}
					</p>
					<Button
						disabled={!!priceIdLoading || active}
						onClick={() => handleCheckout(price)}
					>
						{priceIdLoading
							? 'Redirecting to Stripe...'
							: active
							? 'Active Subscription'
							: 'Subscribe'}
					</Button>
				</>
			}
			title={product.name}
		/>
	);
}

function saasFeatures(): React.ReactElement {
	return (
		<>
			<p>
				10000 email verifications per month.
				<br />
				<br />
			</p>
			<p>
				<a
					href="https://help.reacher.email/email-attributes-inside-json"
					target="_blank"
					rel="noopener noreferrer"
				>
					Full-featured
				</a>{' '}
				email verifications.
				<br />
				Customer support via email/chat.
			</p>
			<p>
				Use <strong>Reacher servers</strong> with high IP reputation.
				<br />
				Cancel anytime.
			</p>
		</>
	);
}

function licenseFeatures(): React.ReactElement {
	return (
		<>
			<p>
				<strong>Unlimited</strong> email verifications.
				<br />
				Self-host. No data sent back to Reacher.
			</p>
			<p>
				<a
					href="https://help.reacher.email/email-attributes-inside-json"
					target="_blank"
					rel="noopener noreferrer"
				>
					Full-featured
				</a>{' '}
				email verifications.
				<br />
				Customer support via email/chat.
			</p>
			<p>
				Self-host Reacher in your <strong>commercial apps</strong>.
				<br />
				Comes with{' '}
				<a
					href="https://help.reacher.email/self-host-guide"
					target="_blank"
					rel="noopener noreferrer"
				>
					self-host guides
				</a>{' '}
				(Heroku, Docker).
				<br />
				Learn more about the{' '}
				<a
					href="https://help.reacher.email/reacher-licenses"
					target="_blank"
					rel="noopener noreferrer"
				>
					full terms and details
				</a>
				.
			</p>
		</>
	);
}
