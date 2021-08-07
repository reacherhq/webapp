import { Button, Text } from '@geist-ui/react';
import { Info } from '@geist-ui/react-icons';
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
import { Card } from './Card';
import styles from './Card.module.css';

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
	const { session, user } = useUser();

	const active = !!subscription;
	const price = product.prices.find(({ currency: c }) => currency === c);
	if (!price || !price.unit_amount) {
		return <p>Error: No price found for product {product.id}.</p>;
	}

	const handleCheckout = async (price: SupabasePrice) => {
		setPriceIdLoading(price.id);

		if (!session) {
			router.push('/signup').catch(sentryException);

			return;
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
			cta={
				<Button
					className="full-width"
					disabled={!!priceIdLoading || active}
					onClick={() => handleCheckout(price)}
					type="success"
				>
					{priceIdLoading
						? session
							? 'Redirecting to Stripe...'
							: 'Redirecting to sign up page...'
						: active
						? 'Current Plan'
						: user
						? 'Upgrade Plan'
						: 'Get Started'}
				</Button>
			}
			features={
				product.id === COMMERCIAL_LICENSE_PRODUCT_ID
					? licenseFeatures()
					: saasFeatures()
			}
			footer={
				product.id === COMMERCIAL_LICENSE_PRODUCT_ID ? (
					<div className="flex">
						<div>
							<Info className={styles.icon} width={24} />
						</div>
						<Text small>
							Want a <strong>free trial</strong> before
							committing? Feel free to try self-hosting with our{' '}
							<a
								href="https://help.reacher.email/self-host-guide"
								target="_blank"
								rel="noopener noreferrer"
							>
								open-source guide
							</a>
							, and subscribe once you&apos;re ready.
						</Text>
					</div>
				) : undefined
			}
			header={
				product.id === COMMERCIAL_LICENSE_PRODUCT_ID ? (
					<Text b small type="success">
						For self-hosting
					</Text>
				) : (
					<Text b small type="warning">
						Most popular
					</Text>
				)
			}
			key={price.product_id}
			price={priceString}
			subtitle={
				product.id === COMMERCIAL_LICENSE_PRODUCT_ID ? (
					'Self-host Reacher with your own infrastructure.'
				) : (
					<span>
						Use Reacher&apos;s servers with <br />
						high IP reputation.
					</span>
				)
			}
			title={product.name}
		/>
	);
}

function saasFeatures(): (string | React.ReactElement)[] {
	return [
		'10000 email verifications per month.',
		<span key="saasFeatures-2">
			<a
				href="https://help.reacher.email/email-attributes-inside-json"
				target="_blank"
				rel="noopener noreferrer"
			>
				Full-featured
			</a>{' '}
			email verifications.
		</span>,
		'Customer support via email/chat.',
		'Cancel anytime.',
	];
}

function licenseFeatures(): (string | React.ReactElement)[] {
	return [
		<span key="licenseFeatures-1">
			<strong>Unlimited</strong> email verifications.
		</span>,
		<span key="licenseFeatures-2">
			Self-host in your <strong>commercial apps</strong>. No data sent
			back to Reacher.
		</span>,
		<span key="licenseFeatures-3">
			<a
				href="https://help.reacher.email/email-attributes-inside-json"
				target="_blank"
				rel="noopener noreferrer"
			>
				Full-featured
			</a>{' '}
			email verifications.
		</span>,
		'Customer support via email/chat.',
		<span key="licenseFeatures-4">
			Comes with{' '}
			<a
				href="https://help.reacher.email/self-host-guide"
				target="_blank"
				rel="noopener noreferrer"
			>
				self-host guides
			</a>{' '}
			(Heroku, Docker).
		</span>,
		<span key="licenseFeatures-5">
			Learn more about the{' '}
			<a
				href="https://help.reacher.email/reacher-licenses"
				target="_blank"
				rel="noopener noreferrer"
			>
				full terms and details
			</a>
			.
		</span>,
	];
}
