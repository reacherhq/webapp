import { addMonths, format } from "date-fns";
import mailgun from "mailgun-js";
// @ts-expect-error No types available
import Attachment from "mailgun-js/lib/attachment";
import Stripe from "stripe";

import { generateLicense } from "@/util/license";

export async function sendLicenseEmail(
	invoice: Stripe.Invoice
): Promise<undefined> {
	if (!invoice.customer_email) {
		throw new Error("Got empty customer_email in invoice.");
	}

	// We only send an email to the $699/mo plan subscribers.
	// For all other invoices, just skip.
	if (invoice.total !== 69900) {
		return;
	}

	if (!invoice.customer_name) {
		throw new Error("customer_name is empty in invoice");
	}

	// Generate PDF with the given info.
	const stripeBuyDate = new Date(invoice.created * 1000);
	const licenseEndDate = addMonths(stripeBuyDate, 1);
	const pdf = await generateLicense({
		backend_version: "<=0.3.x",
		ciee_version: "<=0.8.x",
		license_end_date: licenseEndDate,
		number_devs: 8,
		stripe_buy_date: stripeBuyDate,
		stripe_buyer_name: invoice.customer_name,
		stripe_buyer_email: invoice.customer_email,
		stripe_buyer_address: stripeAddressToString(invoice.customer_address),
	});

	// Send the email with the attached PDF.
	const data = {
		from: "Amaury <amaury@reacher.email>",
		to: "amaury@reacher.email",
		subject: `Reacher Commercial License: ${format(
			stripeBuyDate,
			"dd/MM/yyyy"
		)} to ${format(licenseEndDate, "dd/MM/yyyy")}`,
		text: `Hello ${invoice.customer_name},

Thank you for using Reacher. You will find attached the Commercial License for the period of ${format(
			stripeBuyDate,
			"dd/MM/yyyy"
		)} to ${format(licenseEndDate, "dd/MM/yyyy")}.

A self-host guide can be found at https://docs.reacher.email/self-hosting/install, let me know if you need help.

KR,
Amaury`,
		// eslint-disable-next-line
		attachment: new Attachment({
			...pdf,
			contentType: "application/pdf",
		}),
	};

	const mg = mailgun({
		apiKey: process.env.MAILGUN_API_KEY as string,
		domain: process.env.MAILGUN_DOMAIN as string,
		// We need to set Host for EU zones.
		// https://stackoverflow.com/questions/63489555/mailgun-401-forbidden
		host: "api.eu.mailgun.net",
	});

	await mg.messages().send(data);
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
