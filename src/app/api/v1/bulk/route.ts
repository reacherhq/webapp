import { NextRequest } from "next/server";
import amqplib from "amqplib";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";
import { sentryException } from "@/util/sentry";
import { getWebappURL } from "@/util/helpers";
import { isEarlyResponse } from "@/app/api/v0/check_email/checkUserInDb";
import { SAAS_100K_PRODUCT_ID, getApiUsage } from "@/util/subs";
import { Json } from "@/supabase/database.types";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import { getSubscription } from "@/supabase/supabaseServer";

interface BulkPayload {
	input_type: "array";
	input: string[];
}

export const POST = async (req: NextRequest): Promise<Response> => {
	try {
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
		const subscripton = await getSubscription();

		if (subscripton?.prices?.product_id !== SAAS_100K_PRODUCT_ID) {
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

		const callsUsed = await getApiUsage(supabase, subscripton);

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
		const res2 = await supabaseAdmin
			.from("bulk_emails")
			.insert(
				payload.input.map((email) => ({
					bulk_job_id: bulkJob.id,
					email,
				}))
			)
			.select("*");
		if (res2.error) {
			throw res2.error;
		}

		const conn = await amqplib
			.connect(process.env.RCH_AMQP_ADDR || "amqp://localhost")
			.catch((err) => {
				const message = `Error connecting to RabbitMQ: ${
					(err as AggregateError).errors
						? (err as AggregateError).errors
								.map((e) => e.message)
								.join(", ")
						: err.message
				}`;

				throw new Error(message);
			});

		const ch1 = await conn.createChannel().catch((err) => {
			throw new Error(`Error creating RabbitMQ channel: ${err.message}`);
		});
		const queueName = `check_email.Smtp`; // TODO
		await ch1.assertQueue(queueName, {
			maxPriority: 5,
		});

		res2.data.forEach(({ email, id }) => {
			ch1.sendToQueue(
				queueName,
				Buffer.from(
					JSON.stringify({
						input: {
							to_email: email,
						},
						webhook: {
							url: `${getWebappURL()}/api/v1/bulk/webhook`,
							extra: {
								bulkEmailId: id,
								userId: user.id,
								endpoint: "/v1/bulk",
							},
						},
					})
				),
				{
					contentType: "application/json",
					priority: 1,
				}
			);
		});

		await ch1.close();
		await conn.close();

		return Response.json({
			bulk_job_id: bulkJob.id,
			emails: res2.data.length,
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
