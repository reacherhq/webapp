import { User } from "@supabase/supabase-js";
import Cors from "cors";
import { addMonths, differenceInMilliseconds, parseISO } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { RateLimiterRes } from "rate-limiter-flexible";

import { subApiMaxCalls } from "./subs";
import { SupabaseUser } from "./supabaseClient";
import {
	getActiveSubscription,
	getApiUsageServer,
	getUserByApiToken,
} from "./supabaseServer";

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
export const cors = initMiddleware(
	// You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
	Cors({
		// Only allow requests with GET, POST, OPTIONS and HEAD
		methods: ["GET", "POST", "OPTIONS", "HEAD"],
	})
);

type CheckUserReturnType =
	| {
			user?: undefined;
			sentResponse: true;
	  }
	| {
			user: SupabaseUser;
			sentResponse: false;
	  };

/**
 * Checks the user's authorization token and retrieves user information.
 *
 * @param req - The NextApiRequest object.
 * @param res - The NextApiResponse object.
 * @returns A Promise that resolves to a CheckUserReturnType object.
 * @throws An error if the API token is missing or invalid.
 */
export async function checkUserInDB(
	req: NextApiRequest,
	res: NextApiResponse
): Promise<CheckUserReturnType> {
	const token = req.headers.authorization || req.headers.Authorization;

	if (typeof token !== "string") {
		throw new Error("Expected API token in the Authorization header.");
	}

	const user = await getUserByApiToken(token);
	if (!user) {
		res.status(401).json({ error: "User not found" });
		return { sentResponse: true };
	}

	// Safe to type cast here, as we only need the `id` field below.
	const authUser = { id: user.id } as User;

	// TODO instead of doing another round of network call, we should do a
	// join for subscriptions and API calls inside getUserByApiToken.
	const sub = await getActiveSubscription(authUser);
	const used = await getApiUsageServer(user, sub);

	// Set rate limit headers.
	const now = new Date();
	const nextReset = sub
		? typeof sub.current_period_end === "string"
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
			error: "Too many requests this month. Please upgrade your Reacher plan to make more requests.",
		});

		return { sentResponse: true };
	}

	return { user, sentResponse: false };
}

/**
 * Sets the Rate Limit headers on the response.
 *
 * @param res - The NextJS API response.
 * @param rateLimiterRes - The response object from rate-limiter-flexible.
 * @param limit - The limit per interval.
 */
function setRateLimitHeaders(
	res: NextApiResponse,
	rateLimiterRes: RateLimiterRes,
	limit: number
): void {
	const headers = {
		"Retry-After": rateLimiterRes.msBeforeNext / 1000,
		"X-RateLimit-Limit": limit,
		// When I first introduced rate limiting, some users had used for than
		// 10k emails per month. Their remaining showed e.g. -8270. We decide
		// to show 0 in these cases, hence the Math.max.
		"X-RateLimit-Remaining": Math.max(0, rateLimiterRes.remainingPoints),
		"X-RateLimit-Reset": new Date(
			Date.now() + rateLimiterRes.msBeforeNext
		).toISOString(),
	};

	Object.keys(headers).forEach((k) =>
		res.setHeader(k, headers[k as keyof typeof headers])
	);
}
