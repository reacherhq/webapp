import { ContactsApi, ContactsApiApiKeys } from '@sendinblue/client';
import { format } from 'date-fns';

import { sentryException } from './sentry';
import { SupabaseUser } from './supabaseClient';

export const sendinblueApi = new ContactsApi();

sendinblueApi.setApiKey(
	ContactsApiApiKeys.apiKey,
	process.env.SENDINBLUE_API_KEY as string
);

/**
 * Format a Date into the format accepted by Sendinblue, which is yyyy-MM-dd.
 */
function sendinblueDateFormat(d: Date): string {
	return format(d, 'yyyy-MM-dd');
}

/**
 * Update the LAST_API_CALL field on Sendinblue.
 */
export async function updateSendinblue(user: SupabaseUser): Promise<void> {
	if (!user.sendinblue_contact_id) {
		sentryException(
			new Error(`User ${user.id} does not have a sendinblue_contact_id`)
		);
		return;
	}

	return sendinblueApi
		.updateContact(user.sendinblue_contact_id, {
			attributes: {
				SUPABASE_UUID: user.id, // This should be set already, but we re-set it just in case.
				LAST_API_CALL: sendinblueDateFormat(new Date()),
			},
		})
		.then(() => {
			/* do nothing */
		})
		.catch(sentryException);
}
