// Copied from:
// https://github.com/vercel/nextjs-subscription-payments/blob/c7867b2d9e08d033056293d12aeb9825b8331806/app/api/create-checkout-link/route.ts
// License: MIT

import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { stripe } from "@/util/stripeServer";
import { createOrRetrieveCustomer } from "@/supabase/supabaseAdmin";
import { getWebappURL } from "@/util/helpers";
import { Database } from "@/supabase/database.types";
import { sentryException } from "@/util/sentry";

export async function POST(req: Request) {
	if (req.method === "POST") {
		// 1. Destructure the price and quantity from the POST body
		const {
			price,
			quantity = 1,
			metadata = {},
			...rest
		} = await req.json();
		const locale = rest.locale || "en";

		try {
			// 2. Get the user from Supabase auth
			const supabase = createRouteHandlerClient<Database>({ cookies });
			const {
				data: { user },
			} = await supabase.auth.getUser();

			// 3. Retrieve or create the customer in Stripe
			const customer = await createOrRetrieveCustomer({
				uuid: user?.id || "",
				email: user?.email || "",
			});

			// 4. Create a checkout session in Stripe
			let session;
			if (price.type === "recurring") {
				session = await stripe.checkout.sessions.create({
					payment_method_types: ["card"],
					billing_address_collection: "required",
					customer,
					customer_update: {
						address: "auto",
					},
					line_items: [
						{
							price: price.id,
							quantity,
						},
					],
					locale,
					mode: "subscription",
					allow_promotion_codes: true,
					subscription_data: {
						trial_from_plan: true,
						metadata,
					},
					success_url: `${getWebappURL()}/${locale}/dashboard`,
					cancel_url: `${getWebappURL()}/${locale}/dashboard`,
				});
			} else if (price.type === "one_time") {
				session = await stripe.checkout.sessions.create({
					payment_method_types: ["card"],
					billing_address_collection: "required",
					customer,
					customer_update: {
						address: "auto",
					},
					line_items: [
						{
							price: price.id,
							quantity,
						},
					],
					locale,
					mode: "payment",
					allow_promotion_codes: true,
					success_url: `${getWebappURL()}/${locale}/dashboard`,
					cancel_url: `${getWebappURL()}/${locale}/dashboard`,
				});
			}

			if (session) {
				return new Response(JSON.stringify({ sessionId: session.id }), {
					status: 200,
				});
			} else {
				return new Response(
					JSON.stringify({
						error: {
							statusCode: 500,
							message: "Session is not defined",
						},
					}),
					{ status: 500 }
				);
			}
		} catch (err) {
			sentryException(err as Error);
			return new Response(JSON.stringify(err), { status: 500 });
		}
	} else {
		return new Response("Method Not Allowed", {
			headers: { Allow: "POST" },
			status: 405,
		});
	}
}
