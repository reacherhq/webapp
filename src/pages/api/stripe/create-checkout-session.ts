import { withSentry } from '@sentry/nextjs';
import { NextApiRequest, NextApiResponse } from 'next';

import { getURL } from '../../../util/helpers';
import { sentryException } from '../../../util/sentry';
import { stripe } from '../../../util/stripeServer';
import { SupabasePrice } from '../../../util/supabaseClient';
import { getActiveSubscription, getUser } from '../../../util/supabaseServer';
import { createOrRetrieveCustomer } from '../../../util/useDatabase';

const createCheckoutSession = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> => {
	if (req.method === 'POST') {
		const token = req.headers.token;
		const { price, quantity = 1, metadata = {} } = req.body as {
			price: SupabasePrice;
			quantity: number;
			metadata: Record<string, string>;
		};

		try {
			if (typeof token !== 'string') {
				throw new Error(
					`Expected token as string, got ${typeof token}.`
				);
			}
			const user = await getUser(token);
			if (!user) {
				throw new Error(`Got empty user.`);
			}
			const customer = await createOrRetrieveCustomer(user);
			const subscription = await getActiveSubscription(user);
			if (subscription) {
				throw new Error(
					`You can only have one active subscription at a time. Please cancel your existing subscription${
						subscription.prices?.products?.name
							? ` "${subscription.prices?.products?.name}"`
							: ''
					}.`
				);
			}

			const session = await stripe.checkout.sessions.create({
				payment_method_types: ['card'],
				billing_address_collection: 'required',
				customer,
				line_items: [
					{
						price: price.id,
						quantity,
					},
				],
				mode: 'subscription',
				allow_promotion_codes: true,
				subscription_data: {
					trial_from_plan: true,
					metadata,
				},
				success_url: `${getURL()}/`,
				cancel_url: `${getURL()}/`,
			});

			return res.status(200).json({ sessionId: session.id });
		} catch (err) {
			sentryException(err as Error);
			res.status(500).json({
				error: { statusCode: 500, message: (err as Error).message },
			});
		}
	} else {
		res.setHeader('Allow', 'POST');
		res.status(405).json({ error: 'Method Not Allowed' });
	}
};

export default withSentry(createCheckoutSession);
