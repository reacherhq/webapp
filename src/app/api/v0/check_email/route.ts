import {
	checkUserInDB,
	isEarlyResponse,
} from "@/app/api/v0/check_email/checkUserInDb";
import { updateBrevoLastApiCall } from "@/util/brevo";
import { sentryException } from "@/util/sentry";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { tryAllBackends } from "./backends";
import { CheckEmailInput } from "@reacherhq/api";

// https://vercel.com/changelog/serverless-functions-can-now-run-up-to-5-minutes
export const maxDuration = 300; // 5min
export const runtime = "nodejs"; // https://github.com/orgs/vercel/discussions/4248#discussioncomment-7310341

export async function POST(req: NextRequest): Promise<Response> {
	try {
		const t0 = performance.now();
		Sentry.setTag("rch.route", "/v0/check_email");
		const { user, rateLimitHeaders } = await checkUserInDB(req);
		Sentry.setContext("user", {
			supbaseUuid: user.id,
		});
		const t1 = performance.now();
		console.log(`[🐢] Fetch user from DB: +${Math.round(t1 - t0)}ms`);

		const emailInput = (await req.json()) as CheckEmailInput;
		const res = await tryAllBackends(emailInput, user);

		// Update the LAST_API_CALL field in Brevo.
		const t2 = performance.now();
		try {
			await updateBrevoLastApiCall(user.id, user.sendinblue_contact_id);
		} catch (err) {
			sentryException(err as Error);
		}
		console.log(
			`[🐢] Update Brevo: +${Math.round(performance.now() - t2)}ms`
		);

		console.log(
			`[🐢] Total time: +${Math.round(performance.now() - t0)}ms`
		);
		return Response.json(await res.json(), {
			headers: {
				...res.headers,
				...rateLimitHeaders,
			},
			status: res.status,
		});
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
