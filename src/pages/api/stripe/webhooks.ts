import { withSentry } from '@sentry/nextjs';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

import { sentryException } from '../../util/sentry';
import { stripe } from '../../util/stripeServer';
import {
	manageSubscriptionStatusChange,
	upsertPriceRecord,
	upsertProductRecord,
} from '../../util/useDatabase';

// Stripe requires the raw body to construct the event.
export const config = {
	api: {
		bodyParser: false,
	},
};

async function buffer(readable: NextApiRequest) {
	const chunks = [];
	for await (const chunk of readable) {
		chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
	}
	return Buffer.concat(chunks);
}

const relevantEvents = new Set([
	'product.created',
	'product.updated',
	'price.created',
	'price.updated',
	'checkout.session.completed',
	'customer.subscription.created',
	'customer.subscription.updated',
	'customer.subscription.deleted',
]);

const webhookHandler = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> => {
	if (req.method === 'POST') {
		const buf = await buffer(req);
		const sig = req.headers['stripe-signature'] as string;
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET_LIVE as string;
		let event;

		try {
			event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
		} catch (err) {
			sentryException(err as Error);
			return res
				.status(400)
				.send(`Webhook Error: ${(err as Error).message}`);
		}

		if (relevantEvents.has(event.type)) {
			try {
				switch (event.type) {
					case 'product.created':
					case 'product.updated': {
						await upsertProductRecord(
							event.data.object as Stripe.Product
						);
						break;
					}

					case 'price.created':
					case 'price.updated': {
						await upsertPriceRecord(
							event.data.object as Stripe.Price
						);
						break;
					}

					case 'customer.subscription.created':
					case 'customer.subscription.updated':
					case 'customer.subscription.deleted': {
						const sub = event.data.object as Stripe.Subscription;
						await manageSubscriptionStatusChange(
							sub.id,
							sub.customer as string,
							event.type === 'customer.subscription.created'
						);
						break;
					}

					case 'checkout.session.completed': {
						const checkoutSession = event.data
							.object as Stripe.Checkout.Session;

						if (checkoutSession.mode === 'subscription') {
							const subscriptionId = checkoutSession.subscription;
							if (typeof subscriptionId !== 'string') {
								throw new Error(
									`Got invalid subscriptionId in webhookHandler.`
								);
							}
							if (typeof checkoutSession.customer !== 'string') {
								throw new Error(
									`Got invalid checkoutSession.customer in webhookHandler.`
								);
							}

							await manageSubscriptionStatusChange(
								subscriptionId,
								checkoutSession.customer,
								true
							);
						}
						break;
					}

					default:
						throw new Error('Unhandled relevant event!');
				}
			} catch (err) {
				sentryException(err as Error);
				return res.json({
					error: 'Webhook handler failed. View logs.',
				});
			}
		}

		res.json({ received: true });
	} else {
		res.setHeader('Allow', 'POST');
		res.status(405).json({ error: 'Method Not Allowed' });
	}
};

export default withSentry(webhookHandler);
