import { ContactsApi, ContactsApiApiKeys } from '@sendinblue/client';
import { NextApiRequest, NextApiResponse } from 'next';

import { sentryException } from '../../../util/sentry';
import { getUser } from '../../../util/supabaseServer';

const api = new ContactsApi();
api.setApiKey(
	ContactsApiApiKeys.apiKey,
	process.env.SENDINBLUE_API_KEY as string
);

const createContact = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> => {
	try {
		if (req.method !== 'POST') {
			res.setHeader('Allow', 'POST');
			res.status(405).json({ error: 'Method Not Allowed' });
			return;
		}

		const token = req.headers.authorization || req.headers.Authorization;
		if (typeof token !== 'string') {
			throw new Error('Expected API token in the Authorization header.');
		}

		const user = await getUser(token);
		if (!user) {
			res.status(401).json({ error: 'User not found' });
			return;
		}

		await api.createContact({
			email: user.email,
			attributes: {
				WEBAPP_ENV:
					process.env.VERCEL_ENV === 'production'
						? 'production'
						: 'staging',
			},
			listIds: [7], // List #7 is the Reacher sign up contact list.
		});

		res.status(200).json({ ok: true });
	} catch (err) {
		sentryException(err as Error);
		res.status(500).json({
			error: (err as Error).message,
		});
	}
};

export default createContact;
