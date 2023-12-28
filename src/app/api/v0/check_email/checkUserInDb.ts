import { addMonths, differenceInMilliseconds, parseISO } from "date-fns";
import { RateLimiterRes } from "rate-limiter-flexible";
import { subApiMaxCalls } from "@/util/subs";
import { CheckEmailOutput } from "@reacherhq/api";
import { Tables } from "@/supabase/database.types";
import { SubscriptionWithPrice } from "@/supabase/domain.types";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";

type UserWithSub = {
	user: Tables<"users">;
	subAndCalls: SubAndCalls;
	rateLimitHeaders: HeadersInit;
};

/**
 * Checks the user's authorization token and retrieves user information.
 * Also checks the user's subscription status and sets the rate limit headers.
 *
 * @param req - The NextRequest object.
 * @returns A Promise that resolves to a UserWithSub object.
 * @throws An error if the API token is missing or invalid.
 */
export async function checkUserInDB(req: NextRequest): Promise<UserWithSub> {
	const token =
		req.headers.get("Authorization") || req.headers.get("authorization");

	if (!token) {
		throw newEarlyResponse(
			Response.json(
				{
					error: "Expected API token in the Authorization header.",
				},
				{ status: 401 }
			)
		);
	}

	const { data, error } = await supabaseAdmin
		.from("users")
		.select("*")
		.eq("api_token", token);
	if (error) {
		throw error;
	}
	if (!data?.length) {
		throw newEarlyResponse(
			Response.json(
				{
					error: "Invalid API token.",
				},
				{ status: 401 }
			)
		);
	}
	const user = data[0];

	const res2 = await supabaseAdmin
		.from("sub_and_calls")
		.select("*")
		.eq("user_id", user.id)
		.order("current_period_start", { ascending: false })
		.limit(1)
		.single();
	if (res2.error) {
		throw res2.error;
	}

	const subAndCalls = res2.data;
	const numberOfCalls = subAndCalls.number_of_calls || 0;

	// Set rate limit headers.
	const now = new Date();
	const nextReset = subAndCalls.subscription_id
		? parseISO(subAndCalls.current_period_end as string) // Safe to type cast here, if there's a subscription, there's a current_period_end.
		: addMonths(now, 1);
	const msDiff = differenceInMilliseconds(nextReset, now);
	const max = subApiMaxCalls({
		prices: {
			products: {
				id: subAndCalls.product_id,
			},
		},
	} as SubscriptionWithPrice);
	const rateLimitHeaders = getRateLimitHeaders(
		new RateLimiterRes(
			max - numberOfCalls - 1,
			msDiff,
			numberOfCalls,
			undefined
		), // 1st arg has -1, because we just consumed 1 email.
		max
	);

	if (numberOfCalls > max) {
		throw newEarlyResponse(
			Response.json(
				{
					error: "Too many requests this month. Please upgrade your Reacher plan to make more requests.",
				},
				{ status: 429, headers: rateLimitHeaders }
			)
		);
	}

	return { user, subAndCalls, rateLimitHeaders };
}

interface SubAndCalls {
	current_period_end: string | null;
	current_period_start: string | null;
	number_of_calls: number | null;
	product_id: string | null;
	subscription_id: string | null;
	user_id: string | null;
}

/**
 * Sets the Rate Limit headers on the response.
 *
 * @param res - The NextJS API response.
 * @param rateLimiterRes - The response object from rate-limiter-flexible.
 * @param limit - The limit per interval.
 */
function getRateLimitHeaders(
	rateLimiterRes: RateLimiterRes,
	limit: number
): HeadersInit {
	return {
		"Retry-After": (rateLimiterRes.msBeforeNext / 1000).toString(),
		"X-RateLimit-Limit": limit.toString(),
		// When I first introduced rate limiting, some users had used for than
		// 10k emails per month. Their remaining showed e.g. -8270. We decide
		// to show 0 in these cases, hence the Math.max.
		"X-RateLimit-Remaining": Math.max(
			0,
			rateLimiterRes.remainingPoints
		).toString(),
		"X-RateLimit-Reset": new Date(
			Date.now() + rateLimiterRes.msBeforeNext
		).toISOString(),
	};
}

// Remove sensitive data before storing to DB.
export function removeSensitiveData(
	output: CheckEmailOutput
): CheckEmailOutput {
	const newOutput = { ...output };

	// @ts-expect-error - We don't want to store the server name.
	delete newOutput.debug?.server_name;

	return newOutput;
}

type EarlyResponse = {
	response: Response;
};

export function newEarlyResponse(response: Response): EarlyResponse {
	return { response };
}

export function isEarlyResponse(err: unknown): err is EarlyResponse {
	return (err as EarlyResponse).response !== undefined;
}
