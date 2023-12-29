// Copied from:
// https://github.com/vercel/nextjs-subscription-payments/blob/c7867b2d9e08d033056293d12aeb9825b8331806/app/api/create-portal-link/route.ts
// License: MIT

import { cookies } from "next/headers";
import { stripe } from "@/util/stripeServer";
import { createOrRetrieveCustomer } from "@/supabase/supabaseAdmin";
import { getWebappURL } from "@/util/helpers";
import { sentryException } from "@/util/sentry";
import { createClient } from "@/supabase/server";

export async function POST(req: Request) {
	if (req.method === "POST") {
		try {
			const cookieStore = cookies();
			const supabase = createClient(cookieStore);
			const {
				data: { user },
			} = await supabase.auth.getUser();

			if (!user) throw Error("Could not get user");
			const customer = await createOrRetrieveCustomer({
				uuid: user.id || "",
				email: user.email || "",
			});

			if (!customer) throw Error("Could not get customer");
			// This line was added to the original code.
			const body = (await req.json()) as { locale?: "fr" | "en" };
			const locale = body.locale || "en";
			const { url } = await stripe.billingPortal.sessions.create({
				customer,
				locale,
				return_url: `${getWebappURL()}/${locale}/dashboard/verify`,
			});
			return new Response(JSON.stringify({ url }), {
				status: 200,
			});
		} catch (err) {
			sentryException(err as Error);
			return new Response(
				JSON.stringify({
					error: { statusCode: 500, message: (err as Error).message },
				}),
				{
					status: 500,
				}
			);
		}
	} else {
		return new Response("Method Not Allowed", {
			headers: { Allow: "POST" },
			status: 405,
		});
	}
}
