import axios from "axios";
import { format } from "date-fns";
import mustache from "mustache";
import puppeteer from "puppeteer";
import { marked } from "marked";

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
 * Generate a license for a particular customer, using the predefined template.
 * The function creates a PDF file in the tmp folder, and returns the path to
 * that file.
 *
 * @param metadata - The metadata used to fill the license template.
 */
export async function generateLicense(
	metadata: LicenseMetadata
): Promise<{ filename: string; data: Buffer }> {
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
	const html = await marked.parse(markdownWithoutFrontmatter, {
		async: true,
	});
	console.log("[License Generation] Markdown converted to HTML");

	let browser;
	try {
		// Launch puppeteer
		console.log("[License Generation] Initializing PDF generation engine");
		browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
			timeout: 30000, // 30 seconds timeout for browser launch
		});
		const page = await browser.newPage();

		// Set page timeout
		page.setDefaultNavigationTimeout(30000); // 30 seconds timeout for navigation
		page.setDefaultTimeout(30000); // 30 seconds timeout for other operations

		console.log("[License Generation] PDF generation engine ready");

		// Set the content - simplified since we're dealing with static HTML
		console.log("[License Generation] Rendering HTML content");
		await page.setContent(html);

		// Generate PDF
		console.log("[License Generation] Generating PDF document");
		const pdf = await page.pdf({
			format: "A4",
			margin: {
				top: "2cm",
				right: "2cm",
				bottom: "2cm",
				left: "2cm",
			},
			timeout: 30000, // 30 seconds timeout for PDF generation
		});

		await browser.close();
		console.log("[License Generation] PDF generation completed");

		const filename = `license_${metadata.stripe_buyer_name
			.replace(/ /g, "-")
			.replace(/\./g, "")}_${format(
			metadata.stripe_buy_date,
			"yyyyMMdd"
		)}-${format(metadata.license_end_date, "yyyyMMdd")}.pdf`;

		console.log(
			`[License Generation] License generated successfully: ${filename}`
		);
		return { filename, data: Buffer.from(pdf) };
	} catch (error) {
		console.error(
			"[License Generation] Error during PDF generation:",
			error
		);
		if (browser) {
			await browser
				.close()
				.catch((e) =>
					console.error(
						"[License Generation] Error closing browser:",
						e
					)
				);
		}
		throw new Error(
			`Failed to generate license: ${
				error instanceof Error ? error.message : "Unknown error"
			}`
		);
	}
}
