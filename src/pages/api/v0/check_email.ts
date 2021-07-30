import { withSentry } from '@sentry/nextjs';
import axios, { AxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { sentryException } from '../../../util/sentry';
import { SupabaseCall } from '../../../util/supabaseClient';
import { getUserByApiToken, supabaseAdmin } from '../../../util/supabaseServer';

// Reacher only exposes one endpoint right now, so we're hardcoding it.
const ENDPOINT = `/v0/check_email`;

const checkEmail = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> => {
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		res.status(405).json({ error: 'Method Not Allowed' });
		return;
	}

	try {
		const token = req.headers.authorization || req.headers.Authorization;

		if (typeof token !== 'string') {
			throw new Error(`Expected token as string, got ${typeof token}.`);
		}
		const user = await getUserByApiToken(token);
		if (!user) {
			throw new Error(`Got empty user.`);
		}
		const reacherBackend = process.env.RCH_BACKEND_URL;
		if (!reacherBackend) {
			throw new Error('Got empty reacher backend url.');
		}

		try {
			// Send an API request to Reacher backend, which handles email
			// verifications, see https://github.com/reacherhq/backend.
			const result = await axios.post(
				`${reacherBackend}${ENDPOINT}`,
				req.body
			);

			// If successful, also log an API call entry in the database.
			await supabaseAdmin.from<SupabaseCall>('calls').insert({
				endpoint: ENDPOINT,
				user_id: user.id,
			});

			return res.status(200).json(result.data);
		} catch (err) {
			const statusCode = (err as AxiosError).response?.status;
			if (!statusCode) {
				throw err;
			}

			return res.status(statusCode).json({
				error: (err as AxiosError<unknown>).response?.data,
			});
		}
	} catch (err) {
		sentryException(err as Error);
		res.status(500).json({
			error: (err as Error).message,
		});
	}
};

export default withSentry(checkEmail);
