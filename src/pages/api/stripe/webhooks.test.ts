import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';
import Stripe from 'stripe';

import { getURL } from '../../../util/helpers';
import { stripe } from '../../../util/stripeServer';

const invoiceSucceededEvent: Stripe.Event = {
	id: 'evt_foobar',
	object: 'event',
	api_version: '2020-08-27',
	created: 1661681895,
	data: {
		object: {
			created: 1661681895,
			customer: 'cus_foobar',
			customer_address: {
				city: 'Foo City',
				country: 'Bar Country',
				line1: 'Foobar Street 1',
				line2: '',
				postal_code: 'FO123',
				state: '',
			},
			customer_email: 'foo@bar.baz',
			customer_name: 'Mr. Foo Bar',
			total: 39900,
		},
	},
	livemode: false,
	pending_webhooks: 0,
	request: {
		id: null,
		idempotency_key: null,
	},
	type: 'invoice.payment_succeeded',
};

describe('/api/stripe/webhooks', () => {
	/**
	 * This test requires a server running on `getURL()`. Skipped by default.
	 */
	it('sends an email on invoice payment succeeded', async () => {
		dotenv.config({
			path: path.resolve(process.cwd(), '.env.development.local'),
		});

		// https://stackoverflow.com/questions/65306706/writing-unit-tests-for-stripe-webhooks-stripe-signature
		const payloadString = JSON.stringify(invoiceSucceededEvent, null, 2);
		const secret = process.env.STRIPE_WEBHOOK_SECRET_LIVE as string;
		const header = stripe.webhooks.generateTestHeaderString({
			payload: payloadString,
			secret,
		});

		// This sends to localhost:3000 on your local machine, but to the Vercel
		// deployment during CI.
		const { data } = await axios.post<{
			received: boolean;
			error?: string;
		}>(`${getURL()}/api/stripe/webhooks`, payloadString, {
			headers: {
				'stripe-signature': header,
			},
		});

		expect(data.error).toBeUndefined();
		expect(data.received).toEqual(true);
	});
});

export {};
