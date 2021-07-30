import Stripe from 'stripe';

import pkgJSON from '../../package.json';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY_LIVE as string, {
	// https://github.com/stripe/stripe-node#configuration
	apiVersion: '2020-08-27',
	// Register this as an official Stripe plugin.
	// https://stripe.com/docs/building-plugins#setappinfo
	appInfo: {
		name: pkgJSON.name,
		version: pkgJSON.version,
	},
});
