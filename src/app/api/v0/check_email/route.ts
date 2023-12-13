import { CheckEmailOutput, type CheckEmailInput } from "@reacherhq/api";
import { v4 } from "uuid";
import amqplib from "amqplib";
import dns from "dns/promises";
import {
	checkUserInDB,
	cors,
	isEarlyResponse,
	newEarlyResponse,
	removeSensitiveData,
} from "@/util/api";
import { updateSendinblue } from "@/util/sendinblue";
import { sentryException } from "@/util/sentry";
import { supabaseAdmin } from "@/util/supabaseServer";
import { Tables } from "@/supabase/database.types";
import { NextRequest } from "next/server";

// https://vercel.com/changelog/serverless-functions-can-now-run-up-to-5-minutes
export const maxDuration = 300; // 5min
export const runtime = "nodejs"; // https://github.com/orgs/vercel/discussions/4248#discussioncomment-7310341

const TIMEOUT = 90000; // 90s
const MAX_PRIORITY = 5; // Higher is faster, 5 is max.

export async function POST(req: NextRequest): Promise<Response> {
	const startTime = performance.now();
	console.log("[🐢] POST /v0/check_email");

	const { user } = await checkUserInDB(req);
	const d1 = performance.now() - startTime;
	console.log(`[🐢] checkUserInDB: ${Math.round(d1)}ms`);

	try {
		const body: CheckEmailInput = await req.json();
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
		const replyToPromise = new Promise<CheckEmailOutput>(
			(resolve, reject) => {
				ch1.consume(
					replyQ.queue,
					async function (msg) {
						if (msg?.properties.correlationId === verificationId) {
							const output = JSON.parse(msg.content.toString());
							const d5 = performance.now() - startTime;
							console.log(
								`[🐢] Got consume message: ${Math.round(d5)}ms`
							);

							// Add to supabase
							const response = await supabaseAdmin
								.from<Tables<"calls">>("calls")
								.insert({
									endpoint: "/v0/check_email",
									user_id: user.id,
									backend: output.debug?.server_name,
									domain: output.syntax.domain,
									verification_id: verificationId,
									duration: Math.round(
										(output.debug?.duration.secs || 0) *
											1000 +
											(output.debug?.duration.nanos ||
												0) /
												1000000
									),
									is_reachable: output.is_reachable,
									verif_method:
										output.debug?.smtp?.verif_method?.type,
									result: removeSensitiveData(output),
								});
							if (response.error) {
								reject(
									newEarlyResponse(
										Response.json(
											{
												error: `${response.error.message}: ${response.error.details}`,
											},
											response
										)
									)
								);
							}
							const d6 = performance.now() - startTime;
							console.log(
								`[🐢] Add to supabase: ${Math.round(d6)}ms`
							);

							// Cleanup
							await Promise.all([
								updateSendinblue(
									user.id,
									user.sendinblue_contact_id
								)
									.then(() => {
										const d7 =
											performance.now() - startTime;
										console.log(
											`[🐢] updateSendinblue: ${Math.round(
												d7
											)}ms`
										);
									})
									.catch(sentryException),
								ch1
									.close()
									.then(() => conn.close())
									.then(() => {
										const d8 =
											performance.now() - startTime;
										console.log(
											`[🐢] ch1 and conn.close: ${Math.round(
												d8
											)}ms`
										);
									}),
							]).catch(reject);

							const d9 = performance.now() - startTime;
							console.log(
								`[🐢] Done cleanup: ${Math.round(d9)}ms`
							);
							resolve(output);
						}
					},
					{
						noAck: true,
					}
				).catch(reject);
			}
		);

		const d2 = performance.now() - startTime;
		console.log(`[🐢] AMQP setup: ${Math.round(d2)}ms`);

		const verifMethod = await getVerifMethod(body);
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
		const d3 = performance.now() - startTime;
		console.log(`[🐢] getVerifMethod: ${Math.round(d3)}ms`);

		await ch1.assertQueue(queueName, {
			maxPriority: MAX_PRIORITY,
		});

		ch1.sendToQueue(
			queueName,
			Buffer.from(JSON.stringify({ input: body })),
			{
				contentType: "application/json",
				priority: MAX_PRIORITY,
				correlationId: verificationId,
				replyTo: replyQ.queue,
			}
		);
		const d4 = performance.now() - startTime;
		console.log(`[🐢] sendToQueue: ${Math.round(d4)}ms`);

		// Wait for the response from the reply-to queue.
		const finalRes = await Promise.race([
			replyToPromise.then((output) => Response.json(output)),
			new Promise<Response>((resolve) => {
				setTimeout(() => {
					const d10 = performance.now() - startTime;
					console.log(`[🐢] Timeout error: ${Math.round(d10)}ms`);
					return resolve(
						Response.json(
							{
								error: `The email ${body.to_email} can't be verified within 90s. This is because the email provider imposes obstacles to prevent real-time email verification, such as greylisting. Please try again later.`,
							},
							{ status: 504 }
						)
					);
				}, TIMEOUT);
			}),
		]);

		const d11 = performance.now() - startTime;
		console.log(`[🐢] Final response: ${Math.round(d11)}ms`);
		return finalRes;
	} catch (err) {
		if (isEarlyResponse(err)) {
			return err.response;
		}

		sentryException(err as Error);
		return Response.json(
			{
				error: (err as Error).message,
			},
			{ status: 500 }
		);
	}
}

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
