import axios from 'axios';
import { format } from 'date-fns';
import mdPdf from 'markdown-pdf';
import mustache from 'mustache';

const LICENSE_TEMPLATE =
	'https://raw.githubusercontent.com/reacherhq/policies/master/license/commercial.en.md';

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
	 * The address of the buyer.
	 */
	stripe_buyer_address: string;
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
): Promise<{ filename: string; data: Buffer }> {
	const { data: template } = await axios.get<string>(LICENSE_TEMPLATE);

	// Format date nicely.
	const filledMd = mustache.render(template, {
		...metadata,
		license_end_date: format(metadata.license_end_date, 'MMMM dd yyyy'),
		number_devs: '8 (eight)', // For now we hardcode to 8.
		stripe_buy_date: format(metadata.stripe_buy_date, 'MMMM dd yyyy'),
	});

	return new Promise<{ filename: string; data: Buffer }>(
		(resolve, reject) => {
			mdPdf()
				.from.string(filledMd)
				.to.buffer((err: Error, data: Buffer) => {
					if (err) {
						return reject(err);
					}

					const filename = `license_${metadata.stripe_buyer_name
						.replace(/ /g, '-')
						.replace(/\./g, '')}_${format(
						metadata.stripe_buy_date,
						'yyyyMMdd'
					)}-${format(metadata.license_end_date, 'yyyyMMdd')}.pdf`;

					return resolve({ filename, data });
				});
		}
	);
}
