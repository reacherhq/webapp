import { ContactsApi, ContactsApiApiKeys } from "@getbrevo/brevo";
import { format } from "date-fns";

import { sentryException } from "./sentry";
import { User } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";

export const brevoApi = new ContactsApi();

brevoApi.setApiKey(
	ContactsApiApiKeys.apiKey,
	process.env.SENDINBLUE_API_KEY as string
);

/**
 * Format a Date into the format accepted by Brevo, which is yyyy-MM-dd.
 */
function brevoDateFormat(d: Date): string {
	return format(d, "yyyy-MM-dd");
}

/**
 * Creates a new contact in Brevo for the given user.
 */
export async function createBrevoContact(user: User) {
	try {
		const { body } = await brevoApi.createContact({
			email: user.email,
			attributes: {
				WEBAPP_ENV:
					process.env.VERCEL_ENV === "production"
						? "production"
						: "staging",
				SUPABASE_UUID: user.id,
			},
			listIds: [7], // List #7 is the Reacher sign up contact list.
		});

		if (!body.id) {
			sentryException(
				new Error(
					`Got invalid body for Brevo create contact: ${JSON.stringify(
						body
					)}`
				)
			);
			return;
		}

		await supabaseAdmin
			.from("users")
			.update({
				sendinblue_contact_id: body.id.toString(),
			})
			.eq("id", user.id);
	} catch (apiError) {
		console.error("Error creating Brevo contact:", apiError);
		// Handle the error as needed
	}
}

/**
 * Update the LAST_API_CALL field on Brevo.
 */
export async function updateBrevoLastApiCall(
	userId: string,
	brevoContactId: string | null
): Promise<void> {
	if (!brevoContactId) {
		throw new Error(
			`User ${userId} does not have a sendinblue_contact_id.`
		);
	}

	return brevoApi
		.updateContact(brevoContactId, {
			attributes: {
				SUPABASE_UUID: userId, // This should be set already, but we re-set it just in case.
				LAST_API_CALL: brevoDateFormat(new Date()),
			},
		})
		.then(() => {
			/* do nothing */
		})
		.catch(sentryException);
}
