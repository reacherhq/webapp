import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";
import { generateLicense } from "@/util/license";
import { getSubAndCalls } from "@/supabase/supabaseServer";
import { stripe } from "@/util/stripeServer";
import Stripe from "stripe";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";

export const GET = async (): Promise<Response> => {
	try {
		const cookieStore = cookies();
		const supabase = createClient(cookieStore);
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return Response.json({ error: "Unauthorized" }, { status: 401 });
		}

		const subAndCalls = await getSubAndCalls(user.id);

		const licenseEndDate = subAndCalls.current_period_end;
		if (!licenseEndDate) {
			return Response.json(
				{ error: "No license end date found" },
				{ status: 500 }
			);
		}
		const licenseStartDate = subAndCalls.current_period_start;
		if (!licenseStartDate) {
			return Response.json(
				{ error: "No license start date found" },
				{ status: 500 }
			);
		}

		// TODO: Figure out why normal supabase with cookies isn't working
		const { data, error } = await supabaseAdmin
			.from("customers")
			.select("stripe_customer_id")
			.eq("id", user.id)
			.single();
		if (error) {
			return Response.json({ error: error.message }, { status: 500 });
		}

		const stripeCustomer = (await stripe.customers.retrieve(
			data?.stripe_customer_id || ""
		)) as Stripe.Response<Stripe.Customer>;
		if (!stripeCustomer) {
			return Response.json(
				{ error: "No stripe customer found" },
				{ status: 500 }
			);
		}

		const buyer = stripeCustomer.name || "Reacher User";
		const address = stripeCustomer.address;
		if (!address) {
			return Response.json(
				{ error: "No address found" },
				{ status: 404 }
			);
		}
		const formattedAddress = `${address.line1}, ${address.city}, ${address.state} ${address.postal_code} ${address.country}`;
		const email = user.email || stripeCustomer.email;
		if (!email) {
			return Response.json({ error: "No email found" }, { status: 404 });
		}

		// Generate license
		const license = await generateLicense({
			backend_version: "0.10.x | 0.11.x",
			ciee_version: "0.10.x | 0.11.x",
			license_end_date: new Date(licenseEndDate),
			number_devs: 8,
			stripe_buy_date: new Date(licenseStartDate),
			stripe_buyer_name: buyer,
			stripe_buyer_email: email,
			stripe_buyer_address: formattedAddress,
		});

		if (!license || !license.data) {
			return Response.json(
				{ error: "Failed to generate license PDF" },
				{ status: 500 }
			);
		}

		// Return PDF with proper headers
		return new Response(license.data, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `attachment; filename="${license.filename}"`,
			},
		});
	} catch (error) {
		console.error("Error generating license:", error);
		return Response.json(
			{
				error: `Internal server error while generating license: ${JSON.stringify(
					error
				)}`,
			},
			{ status: 500 }
		);
	}
};
