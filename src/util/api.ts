import Cors from "cors";
import { addMonths, differenceInMilliseconds, parseISO } from "date-fns";
import { NextApiRequest, NextApiResponse } from "next";
import { RateLimiterRes } from "rate-limiter-flexible";

import { subApiMaxCalls } from "./subs";
import { SupabaseSubscription, SupabaseUser } from "./supabaseClient";
import { supabaseAdmin } from "./supabaseServer";

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
			subAndCalls?: undefined;
			sentResponse: true;
	  }
	| {
			user: SupabaseUser;
			subAndCalls: SubAndCalls;
			sentResponse: false;
	  };

/**
 * Checks the user's authorization token and retrieves user information.
 * Also checks the user's subscription status and sets the rate limit headers.
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

	const { data, error } = await supabaseAdmin
		.from<SupabaseUser>("users")
		.select("*")
		.eq("api_token", token);
	if (error) {
		throw error;
	}
	if (!data?.length) {
		res.status(401).json({ error: "Invalid API token." });
		return { sentResponse: true };
	}
	const user = data[0];

	const res2 = await supabaseAdmin
		.from<SubAndCalls>("sub_and_calls")
		.select("*")
		.eq("user_id", user.id)
		.single();
	if (res2.error) {
		throw res2.error;
	}

	const subAndCalls = res2.data;

	// Set rate limit headers.
	const now = new Date();
	const nextReset = subAndCalls.subscription_id
		? typeof subAndCalls.current_period_end === "string"
			? parseISO(subAndCalls.current_period_end)
			: subAndCalls.current_period_end
		: addMonths(now, 1);
	const msDiff = differenceInMilliseconds(nextReset, now);
	const max = subApiMaxCalls({
		prices: {
			products: {
				id: subAndCalls.product_id,
			},
		},
	} as SupabaseSubscription);
	setRateLimitHeaders(
		res,
		new RateLimiterRes(
			max - subAndCalls.number_of_calls - 1,
			msDiff,
			subAndCalls.number_of_calls,
			undefined
		), // 1st arg has -1, because we just consumed 1 email.
		max
	);

	if (subAndCalls.number_of_calls > max) {
		res.status(429).json({
			error: "Too many requests this month. Please upgrade your Reacher plan to make more requests.",
		});

		return { sentResponse: true };
	}

	return { user, subAndCalls, sentResponse: false };
}

interface SubAndCalls {
	user_id: string;
	subscription_id: string | null;
	product_id: string | null;
	email: string;
	current_period_start: string | Date;
	current_period_end: string | Date;
	number_of_calls: number;
	api_token: string;
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
