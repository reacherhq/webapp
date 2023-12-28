import { NextApiRequest, NextApiResponse } from "next";

import { getWebappURL } from "@/util/helpers";
import { sentryException } from "@/util/sentry";
import { stripe } from "@/util/stripeServer";
import { getUser } from "@/util/supabaseServer";
import { createOrRetrieveCustomer } from "@/supabase/supabaseAdmin";

const createPortalLink = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> => {
	if (req.method !== "POST") {
		res.setHeader("Allow", "POST");
		res.status(405).json({ error: "Method Not Allowed" });
		return;
	}

	try {
		const token = req.headers.token;
		const { locale } = req.body as { locale?: "fr" | "en" };

		if (typeof token !== "string") {
			throw new Error(`Expected token as string, got ${typeof token}.`);
		}
		const user = await getUser(token);
		if (!user) {
			throw new Error(`Got empty user.`);
		}
		const customer = await createOrRetrieveCustomer(user);

		const { url } = await stripe.billingPortal.sessions.create({
			customer,
			locale,
			return_url: `${getWebappURL()}/${locale}`,
		});

		return res.status(200).json({ url });
	} catch (err) {
		sentryException(err as Error);
		res.status(500).json({
			error: (err as Error).message,
		});
	}
};

export default createPortalLink;
