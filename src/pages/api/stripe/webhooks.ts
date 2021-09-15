import { withSentry } from '@sentry/nextjs';
import { addMonths, format } from 'date-fns';
import mailgun from 'mailgun-js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Attachment from 'mailgun-js/lib/attachment';
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

import { generateLicense } from '../../../util/license';
import { sentryException } from '../../../util/sentry';
import { stripe } from '../../../util/stripeServer';
import {
	manageSubscriptionStatusChange,
	upsertPriceRecord,
	upsertProductRecord,
} from '../../../util/useDatabase';

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
	'invoice.payment_succeeded',
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

					case 'invoice.payment_succeeded': {
						const invoice = event.data.object as Stripe.Invoice;

						if (!invoice.customer_email) {
							res.status(400).json({
								error: 'Got empty customer_email in invoice.',
							});
							return;
						}

						// We only send an email to the $399/mo plan subscribers.
						// For all other invoices, just skip.
						if (invoice.total !== 39900) {
							return;
						}

						const customerName =
							invoice.customer_name || 'Reacher customer';

						// Generate PDF with the given info.
						const stripeBuyDate = new Date(invoice.created * 1000);
						const licenseEndDate = addMonths(stripeBuyDate, 1);
						const pdf = await generateLicense({
							backend_version: '<=0.3.x',
							ciee_version: '<=0.8.x',
							license_end_date: licenseEndDate,
							number_devs: 8,
							stripe_buy_date: stripeBuyDate,
							stripe_buyer_name: customerName,
							stripe_buyer_email: invoice.customer_email,
						});

						// Send the email with the attached PDF.
						const data = {
							from: 'Amaury <amaury@reacher.email>',
							to: 'amaury@reacher.email',
							subject: `Reacher Commercial License: ${format(
								stripeBuyDate,
								'dd/MM/yyyy'
							)} to ${format(licenseEndDate, 'dd/MM/yyyy')}`,
							text: `Hello ${customerName},

Thank you for using Reacher. You will find attached the Commercial License for the period of ${format(
								stripeBuyDate,
								'dd/MM/yyyy'
							)} to ${format(licenseEndDate, 'dd/MM/yyyy')}.

A self-host guide can be found at https://help.reacher.email/self-host-guide, let me know if you need help.

KR,
Amaury`,
							// eslint-disable-next-line
							attachment: new Attachment({
								...pdf,
								contentType: 'application/pdf',
							}),
						};

						const mg = mailgun({
							apiKey: process.env.MAILGUN_API_KEY as string,
							domain: process.env.MAILGUN_DOMAIN as string,
							// We need to set Host for EU zones.
							// https://stackoverflow.com/questions/63489555/mailgun-401-forbidden
							host: 'api.eu.mailgun.net',
						});

						await mg.messages().send(data);

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
