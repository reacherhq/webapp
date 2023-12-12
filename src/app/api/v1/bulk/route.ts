import { NextRequest } from "next/server";
import amqplib from "amqplib";
import { supabaseAdmin } from "@/util/supabaseServer";
import { sentryException } from "@/util/sentry";
import { getWebappURL } from "@/util/helpers";
import { Tables } from "@/supabase/database.types";

interface BulkPayload {
	input_type: "array";
	input: string[];
}

export const POST = async (req: NextRequest): Promise<Response> => {
	try {
		const user = await getUser(req);

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
		const queueName = `check_email.Headless`; // TODO
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

		return Response.json({ message: "Hello world!", res: res1 });
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

async function getUser(req: NextRequest): Promise<Tables<"users">> {
	const token = req.headers.get("Authorization");

	if (typeof token !== "string") {
		throw new Error("Expected API token in the Authorization header.");
	}

	const { data, error } = await supabaseAdmin
		.from<Tables<"users">>("users")
		.select("*")
		.eq("api_token", token);
	if (error) {
		throw error;
	}
	if (!data?.length) {
		throw {
			response: newEarlyResponse(
				Response.json(
					{ error: "Invalid API token." },
					{
						status: 401,
					}
				)
			),
		};
	}

	return data[0];
}

type EarlyResponse = {
	response: Response;
};

function newEarlyResponse(response: Response): EarlyResponse {
	return { response };
}

function isEarlyResponse(err: unknown): err is EarlyResponse {
	return (err as EarlyResponse).response !== undefined;
}
