import { withSentry } from '@sentry/nextjs';
import { User } from '@supabase/supabase-js';
import axios, { AxiosError } from 'axios';
import Cors from 'cors';
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

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
//
// Copied from https://github.com/vercel/next.js/blob/a342fba00ac0fa57f2685665be52bf42649881b6/examples/api-routes-cors/lib/init-middleware.js
// MIT License Copyright (c) 2021 Vercel, Inc.
function initMiddleware<R>(
	middleware: (
		req: NextApiRequest,
		res: NextApiResponse,
		cb: (r: R) => void
	) => void
): (req: NextApiRequest, res: NextApiResponse) => Promise<R> {
	return (req, res) =>
		new Promise((resolve, reject) => {
			middleware(req, res, (result) => {
				if (result instanceof Error) {
					return reject(result);
				}
				return resolve(result);
			});
		});
}

// Initialize the cors middleware
const cors = initMiddleware(
	// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
	Cors({
		// Only allow requests with GET, POST, OPTIONS and HEAD
		methods: ['GET', 'POST', 'OPTIONS', 'HEAD'],
	})
);

const checkEmail = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> => {
	// Run cors
	await cors(req, res);

	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		res.status(405).json({ error: 'Method Not Allowed' });
		return;
	}

	try {
		const token = req.headers.authorization || req.headers.Authorization;

		if (typeof token !== 'string') {
			throw new Error('Expected API token in the Authorization header.');
		}
		const user = await getUserByApiToken(token);
		if (!user) {
			res.status(401).json({ error: 'User not found' });
			return;
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
