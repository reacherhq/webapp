import {
	checkUserInDB,
	isEarlyResponse,
} from "@/app/api/v0/check_email/checkUserInDb";
import { sentryException } from "@/util/sentry";
import { NextRequest } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { CheckEmailOutput } from "@reacherhq/api";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";
import { convertPgError } from "@/util/helpers";

// WorkerOutput is a Result<CheckEmailOutput, TaskError> type in Rust.
type WorkerOutput = {
	Ok?: CheckEmailOutput;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- We currently don't have a better way to represent TaskError.
	Err?: any;
};

export async function POST(req: NextRequest): Promise<Response> {
	try {
		Sentry.setTag("rch.route", "/v1/commercial_license_trial");
		const { user } = await checkUserInDB(req);
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

		return Response.json({ ok: true });
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
