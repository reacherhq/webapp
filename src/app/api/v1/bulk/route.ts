import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";
import { sentryException } from "@/util/sentry";
import { ENABLE_BULK } from "@/util/helpers";
import { isEarlyResponse } from "@/app/api/v0/check_email/checkUserInDb";
import { SAAS_100K_PRODUCT_ID } from "@/util/subs";
import { Json, Tables } from "@/supabase/database.types";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import { getSubAndCalls } from "@/supabase/supabaseServer";
import { sendEmailsToSQS } from "./sqs";

interface BulkPayload {
	input_type: "array";
	input: string[];
}

export const POST = async (req: NextRequest): Promise<Response> => {
	try {
		if (!ENABLE_BULK) {
			return Response.json(
				{
					error: "Bulk verification is not enabled",
				},
				{
					status: 503,
				}
			);
		}

		const cookieStore = cookies();
		const supabase = createClient(cookieStore);
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return Response.json(
				{
					error: "Not logged in",
				},
				{
					status: 401,
				}
			);
		}
		const subAndCalls = await getSubAndCalls(user.id);

		if (subAndCalls.product_id !== SAAS_100K_PRODUCT_ID) {
			return Response.json(
				{
					error: "Bulk verification is not available on your plan",
				},
				{
					status: 403,
				}
			);
		}

		const payload: BulkPayload = await req.json();

		const callsUsed = subAndCalls.number_of_calls || 0;

		if (payload.input.length + callsUsed > 100_000) {
			return Response.json(
				{
					error: "Verifying more than 100,000 emails per month is not available on your plan. Please contact amaury@reacher.email to upgrade to the Commercial License.",
				},
				{
					status: 403,
				}
			);
		}

		// Add to Supabase
		const res1 = await supabaseAdmin
			.from("bulk_jobs")
			.insert({
				user_id: user.id,
				payload: payload as unknown as Json,
			})
			.select("*");
		if (res1.error) {
			throw res1.error;
		}
		const bulkJob = res1.data[0];
		console.log(`[💪 Supabase] Created job ${bulkJob.id}`);

		// Split Array in chunks of 5000 so that Supabase can handle it.
		const chunkSize = 5000;
		const chunks = [];
		for (let i = 0; i < payload.input.length; i += chunkSize) {
			chunks.push(payload.input.slice(i, i + chunkSize));
		}
		let i = 1;
		let bulkEmails: Tables<"bulk_emails">[] = [];
		for (const chunk of chunks) {
			const res2 = await supabaseAdmin
				.from("bulk_emails")
				.insert(
					chunk.map((email) => ({
						bulk_job_id: bulkJob.id,
						email,
					}))
				)
				.select("*");
			if (res2.error) {
				throw res2.error;
			}
			bulkEmails = bulkEmails.concat(res2.data);

			console.log(
				`[💪 Supabase] Inserted job ${bulkJob.id} chunk ${i++}/${
					chunks.length
				}`
			);
		}

		await sendEmailsToSQS(bulkEmails, user.id);

		return Response.json({
			bulk_job_id: bulkJob.id,
			emails: bulkEmails.length,
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
};
