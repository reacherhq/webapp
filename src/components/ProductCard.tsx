import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { postData } from '../util/helpers';
import { sentryException } from '../util/sentry';
import { getStripe } from '../util/stripeClient';
import type {
	SupabasePrice,
	SupabaseProductWithPrice,
	SupabaseSubscription,
} from '../util/supabaseClient';
import { useUser } from '../util/useUser';
import { StripeMananageButton } from './StripeManageButton';

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
			stripe.redirectToCheckout({ sessionId }).catch(sentryException);
		} catch (err) {
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
		<div className="column col-6 col-mx-auto card" key={price.product_id}>
			<div className="card-header">
				<div className="card-title">
					<h5 className="text-center">{product.name}</h5>
				</div>
				<div className="card-subtitle text-center">
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
				</div>
			</div>
			<div className="card-body">TODO Put features</div>
			{active && (
				<div className="card-footer p-centered">
					<StripeMananageButton>
						Cancel Subscription
					</StripeMananageButton>
					<StripeMananageButton>
						Billing History &amp; Invoices
					</StripeMananageButton>
				</div>
			)}
		</div>
	);
}
