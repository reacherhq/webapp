// Copied from:
// https://github.com/vercel/nextjs-subscription-payments/blob/c7867b2d9e08d033056293d12aeb9825b8331806/app/api/webhooks/route.ts
// License: MIT

import Stripe from "stripe";
import { stripe } from "@/util/stripeServer";
import {
	upsertProductRecord,
	upsertPriceRecord,
	manageSubscriptionStatusChange,
} from "@/supabase/supabaseAdmin";
import { sendLicenseEmail } from "./license";
import { sentryException } from "@/util/sentry";
import { NextApiRequest } from "next";
import type { Readable } from "node:stream";

const relevantEvents = new Set([
	"product.created",
	"product.updated",
	"price.created",
	"price.updated",
	"checkout.session.completed",
	"customer.subscription.created",
	"customer.subscription.updated",
	"customer.subscription.deleted",
]);

// Stripe requires the raw body to construct the event.
export const config = {
	api: {
		bodyParser: false,
	},
};

async function buffer(readable: Readable) {
	const chunks = [];
	for await (const chunk of readable) {
		chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
	}
	return Buffer.concat(chunks);
}

export async function POST(req: NextApiRequest) {
	let event: Stripe.Event;
	try {
		const buf = await buffer(req);
		const sig = req.headers["stripe-signature"] as string;
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

		event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
	} catch (err) {
		console.log(`❌ Error message: ${(err as Error).message}`);
		return new Response(`Webhook Error: ${(err as Error).message}`, {
			status: 400,
		});
	}

	if (relevantEvents.has(event.type)) {
		try {
			switch (event.type) {
				case "product.created":
				case "product.updated":
					await upsertProductRecord(
						event.data.object as Stripe.Product
					);
					break;
				case "price.created":
				case "price.updated":
					await upsertPriceRecord(event.data.object as Stripe.Price);
					break;
				case "customer.subscription.created":
				case "customer.subscription.updated":
				case "customer.subscription.deleted":
					const subscription = event.data
						.object as Stripe.Subscription;
					await manageSubscriptionStatusChange(
						subscription.id,
						subscription.customer as string,
						event.type === "customer.subscription.created"
					);
					break;
				case "checkout.session.completed":
					const checkoutSession = event.data
						.object as Stripe.Checkout.Session;
					if (checkoutSession.mode === "subscription") {
						const subscriptionId = checkoutSession.subscription;
						await manageSubscriptionStatusChange(
							subscriptionId as string,
							checkoutSession.customer as string,
							true
						);
					}
					break;

				case "invoice.payment_succeeded":
					await sendLicenseEmail(event.data.object as Stripe.Invoice);
					break;
				default:
					throw new Error("Unhandled relevant event!");
			}
		} catch (error) {
			sentryException(error as Error);
			return new Response(
				"Webhook handler failed. View your nextjs function logs.",
				{
					status: 400,
				}
			);
		}
	}
	return new Response(JSON.stringify({ received: true }));
}
