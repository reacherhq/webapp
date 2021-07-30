import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { postData } from '../../util/helpers';
import { sentryException } from '../../util/sentry';
import { getStripe } from '../../util/stripeClient';
import type {
	SupabasePrice,
	SupabaseProductWithPrice,
	SupabaseSubscription,
} from '../../util/supabaseClient';
import { useUser } from '../../util/useUser';
import { Card } from '../Card';
import { StripeMananageButton } from '../StripeManageButton';

export interface ProductCardProps {
	product: SupabaseProductWithPrice;
	subscription: SupabaseSubscription | null;
}

export function ProductCard({
	product,
	subscription,
}: ProductCardProps): React.ReactElement {
	const router = useRouter();
	const [priceIdLoading, setPriceIdLoading] = useState<string | false>();
	const { session } = useUser();

	const active = !!subscription;
	const price = product.prices[0];
	if (!price || !price.unit_amount) {
		return <p>Error: No price found for product {product.id}.</p>;
	}

	const handleCheckout = async (price: SupabasePrice) => {
		setPriceIdLoading(price.id);

		if (!session) {
			return router.push('/signin');
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
			body="TODO Features"
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
					<button
						className="btn btn-primary btn-lg"
						disabled={!!priceIdLoading || active}
						onClick={() => handleCheckout(price)}
					>
						{priceIdLoading
							? 'Redirecting to Stripe...'
							: active
							? 'Active Subscription'
							: 'Subscribe'}
					</button>
				</>
			}
			title={product.name}
		/>
	);
}
