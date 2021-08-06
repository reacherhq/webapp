import axios from 'axios';
import { format } from 'date-fns';
import mdPdf from 'markdown-pdf';
import { render } from 'mustache';
import { tmpdir } from 'os';

const LICENSE_TEMPLATE =
	'https://raw.githubusercontent.com/reacherhq/policies/master/license/commercial.md';

export interface LicenseMetadata {
	/**
	 * the version of reacherhq/backend covered by the license.
	 *
	 * @example 0.3.5 or 0.3.*.
	 */
	backend_version: string;
	/**
	 * The version of reacherhq/check-if-email-exists covered by the license.
	 *
	 * @example 0.8.19 or 0.8.*.
	 */
	ciee_version: string;
	/**
	 * The end date of the license.
	 */
	license_end_date: Date;
	/**
	 * Number of developers allowed in the license.
	 */
	number_devs: number;
	/**
	 * The date of the purchase.
	 */
	stripe_buy_date: Date;
	/**
	 * The formatted name of the buyer.
	 */
	stripe_buyer_name: string;
	/**
	 * The formatted name of the buyer.
	 */
	stripe_buyer_email: string;
}

/**
 * Generate a license for a particular customer, using the predefined template.
 * The function creates a PDF file in the tmp folder, and returns the path to
 * that file.
 *
 * @param metadata - The metadata used to fill the license template.
 */
export async function generateLicense(
	metadata: LicenseMetadata
): Promise<string> {
	const { data: template } = await axios.get<string>(LICENSE_TEMPLATE);

	// Format date nicely.

	const filledMd = render(template, {
		...metadata,
		license_end_date: format(metadata.license_end_date, 'MMMM dd yyyy'),
		number_devs: '8 (eight) Licensed developers', // For now we hardcode to 8.
		stripe_buy_date: format(metadata.stripe_buy_date, 'MMMM dd yyyy'),
	});

	const tmp = `${tmpdir()}/license_${metadata.stripe_buyer_name
		.replace(/ /g, '-')
		.replace(/\./g, '')}_${format(
		metadata.stripe_buy_date,
		'yyyyMMdd'
	)}-${format(metadata.license_end_date, 'yyyyMMdd')}.pdf`;
	await new Promise<void>((resolve) => {
		mdPdf().from.string(filledMd).to(tmp, resolve);
	});

	return tmp;
}
