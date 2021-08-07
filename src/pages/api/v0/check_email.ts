import { withSentry } from '@sentry/nextjs';
import { User } from '@supabase/supabase-js';
import axios, { AxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { sentryException } from '../../../util/sentry';
import { subApiMaxCalls } from '../../../util/subs';
import type { SupabaseCall } from '../../../util/supabaseClient';
import {
	getActiveSubscription,
	getApiUsageServer,
	getUserByApiToken,
	supabaseAdmin,
} from '../../../util/supabaseServer';

// Reacher only exposes one endpoint right now, so we're hardcoding it.
const ENDPOINT = `/v0/check_email`;

const checkEmail = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> => {
	console.log('checkEmail');
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

		// Safe to type cast here, as we only need the `id` field below.
		const authUser = { id: user.id } as User;

		// TODO instead of doing another round of network call, we should do a
		// join for subscriptions and API calls inside getUserByApiToken.
		const [sub, used] = await Promise.all([
			getActiveSubscription(authUser),
			getApiUsageServer(user),
		]);

		const max = subApiMaxCalls(sub);
		if (used > max) {
			res.status(429).json({
				error:
					'Too many requests this month. Please upgrade your Reacher plan to make more requests.',
			});
			return;
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
