import {
	getRateLimitHeaders,
	getUserInDB,
	isEarlyResponse,
	newEarlyResponse,
} from "@/app/api/v0/check_email/checkUserInDb";
import { sentryException } from "@/util/sentry";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { CheckEmailOutput } from "@reacherhq/api";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";
import { convertPgError } from "@/util/helpers";
import { Tables } from "@/supabase/database.types";
import { addDays, differenceInMilliseconds, parseISO } from "date-fns";
import { RateLimiterRes } from "rate-limiter-flexible";

// WorkerOutput is a Result<CheckEmailOutput, TaskError> type in Rust.
type WorkerOutput = {
	Ok?: CheckEmailOutput;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- We currently don't have a better way to represent TaskError.
	Err?: any;
};

export async function POST(req: NextRequest): Promise<Response> {
	try {
		Sentry.setTag("rch.route", "/v1/commercial_license_trial");
		const { user, rateLimitHeaders } = await checkUserInDB(req);
		Sentry.setContext("user", {
			supbaseUuid: user.id,
		});

		const checkEmailOutput: WorkerOutput = await req.json();

		// If successful, also log an API call entry in the database.
		const { error } = await supabaseAdmin.from("calls").insert({
			endpoint: "/v1/commercial_license_trial",
			user_id: user.id,
			// @ts-expect-error The new version uses backend_name instead of the old server_name.
			backend: checkEmailOutput.Ok?.debug?.backend_name,
			backend_ip: undefined,
			domain: checkEmailOutput.Ok?.syntax.domain,
			verification_id: undefined,
			duration:
				(checkEmailOutput.Ok?.debug?.duration.secs || 0) * 1000 +
				Math.round(
					(checkEmailOutput.Ok?.debug?.duration.nanos || 0) * 1e-6
				), // in ms
			is_reachable: checkEmailOutput.Ok?.is_reachable,
			verif_method: checkEmailOutput.Ok?.debug?.smtp?.verif_method?.type,
			result: checkEmailOutput.Ok,
			error: checkEmailOutput.Err,
		});
		if (error) {
			throw convertPgError(error);
		}

		return Response.json(
			{ ok: true },
			{
				headers: rateLimitHeaders,
			}
		);
	} catch (err) {
		if (isEarlyResponse(err)) {
			return err.response;
		}

		sentryException(err as Error);
		return Response.json(
			{
				error: (err as Error).message,
			},
			{
				status: 500,
			}
		);
	}
}

/**
 * Checks the user's authorization token and retrieves user information.
 * Also checks the user's subscription status and sets the rate limit headers,
 * but specifically for the /v1/commercial_license_trial endpoint.
 *
 * This is a copy of the checkUserInDB function in /v0/check_email, but tailored
 * for the /v1/commercial_license_trial  endpoint.
 *
 * @param req - The NextRequest object.
 * @returns A Promise that resolves to a UserWithSub object.
 * @throws An error if the API token is missing or invalid.
 */
export async function checkUserInDB(req: NextRequest): Promise<{
	user: Tables<"users">;
	rateLimitHeaders: HeadersInit;
}> {
	const user = await getUserInDB(req);

	const res = await supabaseAdmin
		.from("commercial_license_trial")
		.select("*")
		.eq("user_id", user.id)
		.limit(1)
		.single();
	if (res.error) {
		throw convertPgError(res.error);
	}

	// If the user has a commercial license trial, we need to check the rate limit.
	// First, we limit to 60 calls per minute.
	if ((res.data.calls_last_minute || 0) >= 60) {
		throw newEarlyResponse(
			Response.json(
				{
					error: "Too many requests this minute. Please try again later.",
				},
				{ status: 429 }
			)
		);
	}

	// Then, we limit to 1000 calls per day.
	// We also add rate limit headers to the response.
	const now = new Date();
	const callsInPast24h = res.data.calls_last_day || 0;
	const nextReset = res.data.first_call_in_past_24h
		? addDays(parseISO(res.data.first_call_in_past_24h), 1)
		: addDays(now, 1);
	const msDiff = differenceInMilliseconds(nextReset, now);
	const maxInPast24h = 10000; // Currently, hardcoding this to 10000.
	const rateLimitHeaders = getRateLimitHeaders(
		new RateLimiterRes(
			maxInPast24h - callsInPast24h - 1, // -1 because we just consumed 1 email.
			msDiff,
			callsInPast24h,
			undefined
		),
		maxInPast24h
	);

	if (callsInPast24h >= maxInPast24h) {
		throw newEarlyResponse(
			Response.json(
				{
					error: "Too many requests today. Please contact amaury@reacher.email if you need more verifications for the Commercial License trial.",
				},
				{ status: 429, headers: rateLimitHeaders }
			)
		);
	}

	return { user, rateLimitHeaders };
}
