import type { CheckEmailInput, CheckEmailOutput } from "@reacherhq/api";
import { PostgrestError } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";
import { v4 } from "uuid";
import amqplib from "amqplib";

import { checkUserInDB, cors } from "@/util/api";
import { getWebappURL } from "@/util/helpers";
import { updateSendinblue } from "@/util/sendinblue";
import { sentryException } from "@/util/sentry";
import { SupabaseCall } from "@/util/supabaseClient";
import { supabaseAdmin } from "@/util/supabaseServer";
import { WebhookExtra } from "../calls/webhook";

const TIMEOUT = 60000;
const QUEUE_NAME = "check_email";
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

		const conn = await amqplib.connect(
			process.env.RCH_AMQP_ADDR || "amqp://localhost"
		);
		const ch1 = await conn.createChannel();
		await ch1.assertQueue(QUEUE_NAME, {
			maxPriority: MAX_PRIORITY,
		});

		ch1.sendToQueue(
			QUEUE_NAME,
			Buffer.from(
				JSON.stringify({
					input: req.body as CheckEmailInput,
					webhook: {
						url: `${getWebappURL()}/api/calls/webhook`,
						extra: {
							userId: user.id,
							endpoint: "/v0/check_email",
							verificationId: verificationId,
						} as WebhookExtra,
					},
				})
			),
			{
				priority: MAX_PRIORITY,
			}
		);

		await ch1.close();

		// Poll the database to make sure the call was added.
		let checkEmailOutput: CheckEmailOutput | undefined;
		let lastError: PostgrestError | Error | null = new Error(
			"Timeout verifying email."
		);

		const startTime = Date.now();
		while (!checkEmailOutput && Date.now() - startTime < TIMEOUT - 2000) {
			await new Promise((resolve) => setTimeout(resolve, 500));

			const response = await supabaseAdmin
				.from<SupabaseCall>("calls")
				.select("*")
				.eq("verification_id", verificationId)
				.single();

			// If there's no error, it means the result has been added to the
			// database.
			lastError = response.error;
			if (!response.error) {
				checkEmailOutput = response.data.result;
				break;
			}
		}

		if (lastError) {
			res.status(500).json({
				...lastError,
				error: lastError.message,
			});
			return;
		}

		if (!checkEmailOutput) {
			res.status(500).json({
				error: "Column result was not populated.",
			});
			return;
		}

		res.status(200).json(checkEmailOutput);

		// Update the LAST_API_CALL field in Sendinblue.
		await updateSendinblue(user);
	} catch (err) {
		sentryException(err as Error);
		res.status(500).json({
			error: (err as Error).message,
		});
	}
};

export default POST;
