import { CreateUpdateContactModel } from '@sendinblue/client';
import type { User } from '@supabase/supabase-js';
import { NextApiRequest, NextApiResponse } from 'next';

import { sendinblueApi } from '../../../util/sendinblue';
import { sentryException } from '../../../util/sentry';
import type { SupabaseUser } from '../../../util/supabaseClient';
import { getUser, supabaseAdmin } from '../../../util/supabaseServer';

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

		const { body } = await sendinblueApi.createContact({
			email: user.email,
			attributes: {
				WEBAPP_ENV:
					process.env.VERCEL_ENV === 'production'
						? 'production'
						: 'staging',
				SUPABASE_UUID: user.id,
			},
			listIds: [7], // List #7 is the Reacher sign up contact list.
		});

		await updateUserSendinblueContactId(user, body);

		res.status(200).json({ ok: true });
	} catch (err) {
		sentryException(err as Error);
		res.status(500).json({
			error: (err as Error).message,
		});
	}
};

export default createContact;

/**
 * Update the Sendinblue contact id for the given user.
 */
async function updateUserSendinblueContactId(
	user: User,
	body: CreateUpdateContactModel
): Promise<void> {
	if (!body.id) {
		sentryException(
			new Error(
				`Got invalid body for Sendinblue create contact: ${JSON.stringify(
					body
				)}`
			)
		);
		return;
	}

	await supabaseAdmin
		.from<SupabaseUser>('users')
		.update({
			sendinblue_contact_id: body.id.toString(),
		})
		.eq('id', user.id);
}
