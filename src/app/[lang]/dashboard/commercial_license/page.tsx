import { dictionary } from "@/dictionaries";
import React from "react";
import { GetStartedTrial } from "./GetStartedTrial";
import { Dashboard } from "../Dashboard";
import {
	getSession,
	getSubAndCalls,
	getUserDetails,
} from "@/supabase/supabaseServer";
import { redirect } from "next/navigation";
import { COMMERCIAL_LICENSE_PRODUCT_ID } from "@/util/subs";
import { GetStartedPaid } from "./GetStartedPaid";
import { Tables } from "@/supabase/database.types";
import { LicenseMetadata } from "@/app/[lang]/dashboard/commercial_license/license";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";
import { User } from "@supabase/supabase-js";
import { stripe } from "@/util/stripeServer";
import Stripe from "stripe";

export default async function CommercialLicensePage({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const session = await getSession();
	if (!session) {
		return redirect(`/${lang}/login`);
	}

	const subAndCalls = await getSubAndCalls(session.user.id);
	const userDetails = await getUserDetails();
	const d = await dictionary(lang);
	const licenseMetadata = await getLicenseMetadata(subAndCalls, session.user);

	return (
		<Dashboard
			d={d}
			subAndCalls={subAndCalls}
			showApiUsage={false}
			tab="commercial_license"
		>
			{subAndCalls.product_id === COMMERCIAL_LICENSE_PRODUCT_ID &&
			subAndCalls.status === "active" ? (
				<GetStartedPaid
					lang={lang}
					d={d}
					user={session.user}
					userDetails={userDetails}
					subAndCalls={subAndCalls}
					licenseMetadata={licenseMetadata}
				/>
			) : (
				<GetStartedTrial
					d={d}
					user={session.user}
					userDetails={userDetails}
				/>
			)}
		</Dashboard>
	);
}

async function getLicenseMetadata(
	subAndCalls: Tables<"sub_and_calls">,
	user: User
): Promise<LicenseMetadata> {
	const licenseEndDate = subAndCalls.current_period_end;
	if (!licenseEndDate) {
		throw new Error("No license end date found");
	}
	const licenseStartDate = subAndCalls.current_period_start;
	if (!licenseStartDate) {
		throw new Error("No license start date found");
	}

	// TODO: Figure out why normal supabase with cookies isn't working
	const { data, error } = await supabaseAdmin
		.from("customers")
		.select("stripe_customer_id")
		.eq("id", user.id)
		.single();
	if (error) {
		throw new Error(error.message);
	}

	const stripeCustomer = (await stripe.customers.retrieve(
		data?.stripe_customer_id || ""
	)) as Stripe.Response<Stripe.Customer>;
	if (!stripeCustomer) {
		throw new Error("No stripe customer found");
	}

	const buyer = stripeCustomer.name || "Reacher User";
	const address = stripeCustomer.address;
	if (!address) {
		throw new Error("No address found");
	}
	const formattedAddress = stripeAddressToString(address);
	const email = user.email || stripeCustomer.email;
	if (!email) {
		throw new Error("No email found");
	}

	return {
		backend_version: "0.10.x to 0.11.x",
		ciee_version: "0.10.x to 0.11.x",
		license_end_date: new Date(licenseEndDate),
		number_devs: 8,
		stripe_buy_date: new Date(licenseStartDate),
		stripe_buyer_address: formattedAddress,
		stripe_buyer_name: buyer,
		stripe_buyer_email: email,
	};
}

/**
 * Convert a Stripe.Address object to string representing the address.
 */
function stripeAddressToString(addr: Stripe.Address | null): string {
	if (
		!addr ||
		!addr.line1 ||
		!addr.postal_code ||
		!addr.city ||
		!addr.country
	) {
		throw new Error(`Got invalid address: ${JSON.stringify(addr)}`);
	}

	return [
		addr.line1,
		addr.line2,
		addr.postal_code,
		addr.city,
		addr.state,
		addr.country,
	]
		.filter((x) => !!x)
		.join(", ");
}
