import { ContactsApi, ContactsApiApiKeys } from "@sendinblue/client";
import { format } from "date-fns";

import { sentryException } from "./sentry";
import { SupabaseUser } from "./supabaseClient";
import { supabaseAdmin } from "./supabaseServer";

export const sendinblueApi = new ContactsApi();

sendinblueApi.setApiKey(
	ContactsApiApiKeys.apiKey,
	process.env.SENDINBLUE_API_KEY as string
);

/**
 * Format a Date into the format accepted by Sendinblue, which is yyyy-MM-dd.
 */
function sendinblueDateFormat(d: Date): string {
	return format(d, "yyyy-MM-dd");
}

/**
 * Update the LAST_API_CALL field on Sendinblue.
 */
export async function updateSendinblue(
	userId: string,
	sendinblueContactId?: string
): Promise<void> {
	let sibId = sendinblueContactId;
	if (!sibId) {
		const res = await supabaseAdmin
			.from<SupabaseUser>("users")
			.select("sendinblue_contact_id")
			.eq("id", userId);
		if (res.error) {
			throw res.error;
		}
		if (!res.data?.length || !res.data[0].sendinblue_contact_id) {
			throw new Error(
				`User ${userId} does not have a sendinblue_contact_id.`
			);
		}

		sibId = res.data[0].sendinblue_contact_id;
	}

	return sendinblueApi
		.updateContact(sibId, {
			attributes: {
				SUPABASE_UUID: userId, // This should be set already, but we re-set it just in case.
				LAST_API_CALL: sendinblueDateFormat(new Date()),
			},
		})
		.then(() => {
			/* do nothing */
		})
		.catch(sentryException);
}
