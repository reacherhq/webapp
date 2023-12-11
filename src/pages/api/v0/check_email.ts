import type { CheckEmailInput, CheckEmailOutput } from "@reacherhq/api";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 } from "uuid";
import amqplib from "amqplib";
import dns from "dns/promises";

import { checkUserInDB, cors } from "@/util/api";
import { updateSendinblue } from "@/util/sendinblue";
import { sentryException } from "@/util/sentry";
import { SupabaseCall } from "@/util/supabaseClient";
import { supabaseAdmin } from "@/util/supabaseServer";

const TIMEOUT = 50000;
const MAX_PRIORITY = 5; // Higher is faster, 5 is max.

const POST = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> => {
	// Run cors
	await cors(req, res);

	if (req.method !== "POST") {
		res.setHeader("Allow", "POST");
		res.status(405).json({ error: "Method Not Allowed" });
		return;
	}

	const { user, sentResponse } = await checkUserInDB(req, res);
	if (sentResponse) {
		return;
	}

	try {
		const verificationId = v4();

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

		// Listen to the reply on this reply queue.
		// Follow https://www.rabbitmq.com/tutorials/tutorial-six-javascript.html
		const replyQ = await ch1.assertQueue("", {
			exclusive: true,
		});
		await ch1.consume(
			replyQ.queue,
			async function (msg) {
				if (msg?.properties.correlationId === verificationId) {
					const output = JSON.parse(msg.content.toString());

					// Add to supabase
					const response = await supabaseAdmin
						.from<SupabaseCall>("calls")
						.insert({
							endpoint: "/v0/check_email",
							user_id: user.id,
							backend: output.debug?.server_name,
							domain: output.syntax.domain,
							verification_id: verificationId,
							duration: Math.round(
								(output.debug?.duration.secs || 0) * 1000 +
									(output.debug?.duration.nanos || 0) /
										1000000
							),
							is_reachable: output.is_reachable,
							verif_method:
								output.debug?.smtp?.verif_method?.type,
							result: removeSensitiveData(output),
						});
					if (response.error) {
						res.status(response.status).json(response.error);
						return;
					}

					await ch1.close();
					await conn.close();

					await updateSendinblue(user);

					res.status(200).json(output);
				}
			},
			{
				noAck: true,
			}
		);

		const verifMethod = await getVerifMethod(req.body as CheckEmailInput);
		const queueName = `check_email.${
			// If the verifMethod is "Api", we use the "Headless" queue instead,
			// because the same workers that handle the "Headless" queue also
			// handle the "Api" queue.
			//
			// In this case, we leave the "Smtp" workers only with one task:
			// Smtp. Hopefully this will make it easier to maintain their IP
			// reputation.
			verifMethod === "Api" ? "Headless" : verifMethod
		}`;
		await ch1.assertQueue(queueName, {
			maxPriority: MAX_PRIORITY,
		});

		ch1.sendToQueue(
			queueName,
			Buffer.from(
				JSON.stringify({
					input: req.body as CheckEmailInput,
				})
			),
			{
				contentType: "application/json",
				priority: MAX_PRIORITY,
				correlationId: verificationId,
				replyTo: replyQ.queue,
			}
		);

		setTimeout(() => {
			res.status(504).json({
				error: `The email ${
					(req.body as CheckEmailInput).to_email
				} can't be verified within 1 minute. This is because the email provider imposes obstacles to prevent real-time email verification, such as greylisting. Please try again later.`,
			});
		}, TIMEOUT);
	} catch (err) {
		sentryException(err as Error);
		res.status(500).json({
			error: (err as Error).message,
		});
	}
};

export default POST;

// getVerifMethod returns the verifMethod that is best used to verify the
// input's email address.
async function getVerifMethod(input: CheckEmailInput): Promise<string> {
	try {
		const domain = input.to_email.split("@")[1];
		if (!domain) {
			return "Smtp";
		}

		const records = await dns.resolveMx(domain);
		if (
			input.yahoo_verif_method !== "Smtp" &&
			records.some((r) => r.exchange.endsWith(".yahoodns.net")) // Note: there's no "." at the end of the domain.
		) {
			return "Headless";
		} else if (
			input.hotmail_verif_method !== "Smtp" &&
			records.some((r) => r.exchange.endsWith(".protection.outlook.com")) // Note: there's no "." at the end of the domain.
		) {
			return "Headless";
		} else if (
			input.gmail_verif_method !== "Smtp" &&
			records.some((r) => r.exchange.endsWith(".google.com")) // Note: there's no "." at the end of the domain.
		) {
			return "Api";
		} else {
			return "Smtp";
		}
	} catch (err) {
		return "Smtp";
	}
}

// Remove sensitive data before storing to DB.
function removeSensitiveData(output: CheckEmailOutput): CheckEmailOutput {
	const newOutput = { ...output };

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	delete newOutput.debug?.server_name;

	return newOutput;
}
