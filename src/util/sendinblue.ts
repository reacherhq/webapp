import { ContactsApi, ContactsApiApiKeys } from '@sendinblue/client';
import { format } from 'date-fns';

export const sendinblueApi = new ContactsApi();

sendinblueApi.setApiKey(
	ContactsApiApiKeys.apiKey,
	process.env.SENDINBLUE_API_KEY as string
);

/**
 * Format a Date into the format accepted by Sendinblue, which is yyyy-MM-dd.
 */
export function sendinblueDateFormat(d: Date): string {
	return format(d, 'yyyy-MM-dd');
}
