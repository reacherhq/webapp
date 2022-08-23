import type { CheckEmailInput, CheckEmailOutput } from '@reacherhq/api';
import { withSentry } from '@sentry/nextjs';
import { User } from '@supabase/supabase-js';
import axios, { AxiosError, AxiosRequestHeaders } from 'axios';
import Cors from 'cors';
import { addMonths, differenceInMilliseconds, parseISO } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';
import { RateLimiterMemory, RateLimiterRes } from 'rate-limiter-flexible';
import { getClientIp } from 'request-ip';
import { v4 } from 'uuid';

import { setRateLimitHeaders } from '../../../util/helpers';
import { sentryException } from '../../../util/sentry';
import { subApiMaxCalls } from '../../../util/subs';
import { SupabaseCall, SupabaseUser } from '../../../util/supabaseClient';
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

/**
 * The API token on the landing page, for public demo usage, heavily
 * rate-limited.
 */
const TEST_API_TOKEN = 'test_api_token';

const EMAILS_PER_MINUTE = 2;

const rateLimiter = new RateLimiterMemory({
	points: EMAILS_PER_MINUTE, // 2 emails
	duration: 60, // Per minute
});

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

		// Handle the landing page demo token.
		if (token === TEST_API_TOKEN) {
			if (process.env.DISABLE_TEST_API_TOKEN) {
				res.status(401).json({
					error: 'Reacher is turning off the public endpoint to prevent spam abuse. Please create a free Reacher account for now for 50 emails / month, until an anti-spam measure has been deployed.',
				});

				return;
			}

			try {
				const rateLimiterRes = await rateLimiter.consume(
					getClientIp(req) || 'FALLBACK_IP',
					1
				); // Consume 1 email verification
				setRateLimitHeaders(res, rateLimiterRes, EMAILS_PER_MINUTE);

				const reacherBackends = getReacherBackends();
				const backendRes = await makeSingleBackendCall(
					v4(),
					reacherBackends[reacherBackends.length - 1], // Make the call to only 1 backend, the last one, to avoid spamming all others.
					req,
					user
				);

				return res.status(200).json(backendRes);
			} catch (rateLimiterRes) {
				res.status(429).json({ error: 'Rate limit exceeded' });
				setRateLimitHeaders(
					res,
					rateLimiterRes as RateLimiterRes,
					EMAILS_PER_MINUTE
				);
				return;
			}
		} else {
			// Handle a normal user doing an API call.

			// TODO instead of doing another round of network call, we should do a
			// join for subscriptions and API calls inside getUserByApiToken.
			const sub = await getActiveSubscription(authUser);
			const used = await getApiUsageServer(user, sub);

			// Set rate limit headers.
			const now = new Date();
			const nextReset = sub
				? typeof sub.current_period_end === 'string'
					? parseISO(sub.current_period_end)
					: sub.current_period_end
				: addMonths(now, 1);
			const msDiff = differenceInMilliseconds(nextReset, now);
			const max = subApiMaxCalls(sub);
			setRateLimitHeaders(
				res,
				new RateLimiterRes(max - used - 1, msDiff, used, undefined), // 1st arg has -1, because we just consumed 1 email.
				max
			);

			if (used > max) {
				res.status(429).json({
					error: 'Too many requests this month. Please upgrade your Reacher plan to make more requests.',
				});

				return;
			}

			return tryAllBackends(req, res, user);
		}
	} catch (err) {
		sentryException(err as Error);
		res.status(500).json({
			error: (err as Error).message,
		});
	}
};

export default withSentry(checkEmail);

/**
 * Forwards the Next.JS request to Reacher's backends, try them all in the
 * order given by `RCH_BACKENDS` env variable.
 */
async function tryAllBackends(
	req: NextApiRequest,
	res: NextApiResponse,
	user: SupabaseUser
) {
	try {
		const reacherBackends = getReacherBackends();

		// Create a unique UUID for each verification. The purpose of this
		// verificationId is that we insert one row in the `calls` table per
		// backend call. However, if we try the backends sequentially, we don't
		// want to charge the user 2 credits for 1 email verification.
		const verificationId = v4();

		// Note that we don't loop the last element of reacherBackends. That
		// one gets treated specially, as we'll always return its response.
		for (let i = 0; i < reacherBackends.length - 1; i++) {
			try {
				const result = await makeSingleBackendCall(
					verificationId,
					reacherBackends[i],
					req,
					user
				);

				if (result.is_reachable !== 'unknown') {
					return res.status(200).json(result);
				}
			} catch {
				// Continue loop
			}
		}

		// If we arrive here, it means all previous backend calls errored or
		// returned "unknown". We make the last backend call, and always return
		// its response.
		const result = await makeSingleBackendCall(
			verificationId,
			reacherBackends[reacherBackends.length - 1],
			req,
			user
		);

		return res.status(200).json(result);
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

/**
 * Make a single call to the backend, and log some metadata to the DB.
 */
async function makeSingleBackendCall(
	verificationId: string,
	reacherBackend: ReacherBackend,
	req: NextApiRequest,
	user: SupabaseUser
): Promise<CheckEmailOutput> {
	// Measure the API request time.
	const startDate = new Date();

	// Send an API request to Reacher backend, which handles email
	// verifications, see https://github.com/reacherhq/backend.
	const result = await axios.post<CheckEmailOutput>(
		`${reacherBackend.url}${ENDPOINT}`,
		req.body,
		{
			headers: {
				'x-reacher-secret': process.env.RCH_HEADER_SECRET || '',
			},
		}
	);

	const endDate = new Date();

	// Get the domain of the email, i.e. the part after '@'.
	const email = req.body as CheckEmailInput;
	const parts = email.to_email.split('@');
	const domain = parts && parts[1];

	// If successful, also log an API call entry in the database.
	const { error } = await supabaseAdmin.from<SupabaseCall>('calls').insert({
		endpoint: ENDPOINT,
		user_id: user.id,
		backend: reacherBackend.url,
		backend_ip:
			reacherBackend.ip ||
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			(result.request?.socket?.remoteAddress as string),
		domain,
		verification_id: verificationId,
		duration: endDate.getTime() - startDate.getTime(), // In ms.
		is_reachable: result.data.is_reachable,
	});

	if (error) throw error;

	return result.data;
}

interface ReacherBackend {
	/**
	 * Is bulk email verification enabled
	 */
	hasBulk: boolean;
	/**
	 * IP address of the backend (if known).
	 */
	ip?: string;
	/**
	 * Backend URL.
	 */
	url: string;
}

// Cache the result of the getReacherBackends parsing function.
let cachedReacherBackends: ReacherBackend[] | undefined;

/**
 * Get all of Reacher's internal backends, as an array.
 */
function getReacherBackends(): ReacherBackend[] {
	if (cachedReacherBackends) {
		return cachedReacherBackends;
	}
	cachedReacherBackends;
	if (!process.env.RCH_BACKENDS) {
		throw new Error('Got empty RCH_BACKENDS env var.');
	}

	// RCH_BACKENDS is an array of all Reacher's internal backends.
	cachedReacherBackends = JSON.parse(
		process.env.RCH_BACKENDS
	) as ReacherBackend[];

	return cachedReacherBackends;
}
