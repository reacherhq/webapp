import {
	checkUserInDB,
	isEarlyResponse,
} from "@/app/api/v0/check_email/checkUserInDb";
import { updateSendinblue } from "@/util/sendinblue";
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
		Sentry.setTag("rch.route", "/v0/check_email");
		const { user, rateLimitHeaders } = await checkUserInDB(req);
		Sentry.setContext("user", {
			supbaseUuid: user.id,
		});

		const emailInput = (await req.json()) as CheckEmailInput;
		const res = await tryAllBackends(emailInput, user);

		// Update the LAST_API_CALL field in Sendinblue.
		await updateSendinblue(user.id, user.sendinblue_contact_id);

		return Response.json(res.body, {
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
