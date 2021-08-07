import { withSentry } from '@sentry/nextjs';
import { User } from '@supabase/supabase-js';
import axios, { AxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

import { sentryException } from '../../../util/sentry';
import { subApiMaxCalls } from '../../../util/subs';
import type { SupabaseCall, SupabaseUser } from '../../../util/supabaseClient';
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
	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		res.status(405).json({ error: 'Method Not Allowed' });
		return;
	}

	try {
		// Handle legacy saasify requests.
		// Saasify deployments prior to 02d0b224 forward requests to
		// `api.reacher.email`, which is where this code is deployed. To avoid
		// cyclic requests, we simply forward the request to Heroku.
		// TODO Remove https://github.com/reacherhq/webapp/issues/54
		if (
			req.headers['x-saasify-proxy-secret'] ===
			process.env.LEGACY_SAASIFY_SECRET
		) {
			return forwardToHeroku(req, res);
		}

		const token = req.headers.authorization || req.headers.Authorization;

		if (typeof token !== 'string') {
			throw new Error('Expected API token in the Authorization header.');
		}
		const user = await getUserByApiToken(token);
		if (!user) {
			// Once we migrate away from Saasify, we only use our own tokens,
			// so we should instead return 401 if the user is not found.
			// TODO https://github.com/reacherhq/webapp/issues/54
			return forwardToHeroku(req, res);
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

		return forwardToHeroku(req, res, user);
	} catch (err) {
		sentryException(err as Error);
		res.status(500).json({
			error: (err as Error).message,
		});
	}
};

export default withSentry(checkEmail);

async function forwardToHeroku(
	req: NextApiRequest,
	res: NextApiResponse,
	user?: SupabaseUser
) {
	try {
		const reacherBackend = process.env.RCH_BACKEND_URL;
		if (!reacherBackend) {
			throw new Error('Got empty reacher backend url.');
		}

		// Send an API request to Reacher backend, which handles email
		// verifications, see https://github.com/reacherhq/backend.
		const result = await axios.post(
			`${reacherBackend}${ENDPOINT}`,
			req.body
		);

		if (user) {
			// If successful, also log an API call entry in the database.
			await supabaseAdmin.from<SupabaseCall>('calls').insert({
				endpoint: ENDPOINT,
				user_id: user.id,
			});
		}

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
}
