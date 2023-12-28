import { NextRequest } from "next/server";
import amqplib from "amqplib";
import { supabaseAdmin } from "@/util/supabaseServer";
import { sentryException } from "@/util/sentry";
import { ENABLE_BULK, getWebappURL } from "@/util/helpers";
import { checkUserInDB, isEarlyResponse } from "@/util/api";
import { SAAS_100K_PRODUCT_ID } from "@/util/subs";

interface BulkPayload {
	input_type: "array";
	input: string[];
}

export const POST = async (req: NextRequest): Promise<Response> => {
	// TODO Remove this once we allow Bulk.
	if (ENABLE_BULK === 0) {
		return Response.json(
			{ error: "Not available in production" },
			{ status: 403 }
		);
	}

	try {
		const { user, subAndCalls } = await checkUserInDB(req);

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

		// Add to Supabase
		const res1 = await supabaseAdmin
			.from("bulk_jobs")
			.insert({
				user_id: user.id,
				payload,
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
