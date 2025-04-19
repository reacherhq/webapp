import axios from "axios";
import { format } from "date-fns";
import mustache from "mustache";

const LICENSE_TEMPLATE =
	"https://raw.githubusercontent.com/reacherhq/policies/master/license/commercial.en.md";

/**
 * Removes frontmatter (content between ---) from markdown content
 */
function removeFrontmatter(markdown: string): string {
	return markdown.replace(/^---[\s\S]*?---\n/, "");
}

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
 * Generate a markdown license document for a particular customer using the predefined template.
 * The function retrieves the template, populates it with customer metadata, and returns
 * the processed markdown content with frontmatter removed.
 *
 * @param metadata - The metadata used to fill the license template, including customer details,
 *                  version information, and license dates.
 * @returns A Promise that resolves to the processed markdown content as a string.
 */
export async function generateMarkdown(
	metadata: LicenseMetadata
): Promise<string> {
	console.log(
		`[License Generation] Starting license generation for customer: ${metadata.stripe_buyer_name}`
	);

	const { data: template } = await axios.get<string>(LICENSE_TEMPLATE);
	console.log("[License Generation] Successfully retrieved license template");

	// Format date nicely.
	const filledMd = mustache.render(template, {
		...metadata,
		license_end_date: format(metadata.license_end_date, "MMMM dd yyyy"),
		number_devs: "8 (eight)", // For now we hardcode to 8.
		stripe_buy_date: format(metadata.stripe_buy_date, "MMMM dd yyyy"),
	});
	console.log("[License Generation] Template populated with customer data");

	// Remove frontmatter and convert markdown to HTML
	const markdownWithoutFrontmatter = removeFrontmatter(filledMd);

	return markdownWithoutFrontmatter;
}
