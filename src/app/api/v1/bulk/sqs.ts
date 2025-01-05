import { Tables } from "@/supabase/database.types";
import { SQSClient, SendMessageBatchCommand } from "@aws-sdk/client-sqs";
import type { CheckEmailInput } from "@reacherhq/api";
import type { WebhookExtra } from "./webhook/route";
import { getWebappURL } from "@/util/helpers";

// Initialize the SQS client
const sqsClient = new SQSClient({ region: "eu-west-3" });

const queueUrl =
	"https://sqs.eu-west-3.amazonaws.com/430118836964/check-email-queue";

// Matches this Rust struct:
// https://github.com/reacherhq/check-if-email-exists/blob/v0.10.1/backend/src/worker/do_work.rs#L34
type CheckEmailTask = {
	input: CheckEmailInput;
	job_id: {
		bulk: number;
	};
	webhook?: {
		on_each_email?: {
			url: string;
			headers: Record<string, string | undefined>;
			extra: WebhookExtra;
		};
	};
};

export const sendEmailsToSQS = async (
	bulkEmails: Tables<"bulk_emails">[],
	userId: string
) => {
	const command = new SendMessageBatchCommand({
		QueueUrl: queueUrl,
		Entries: bulkEmails.map((bulkEmail) => ({
			Id: bulkEmail.id.toString(),
			MessageBody: JSON.stringify(bulkEmailToTask(bulkEmail, userId)),
		})),
	});

	const response = await sqsClient.send(command);
	console.log(
		"[💪 SQS] Message sent successfully:",
		JSON.stringify(response)
	);
};

function bulkEmailToTask(
	bulkEmail: Tables<"bulk_emails">,
	userId: string
): CheckEmailTask {
	return {
		input: {
			to_email: bulkEmail.email,
		},
		job_id: {
			bulk: bulkEmail.bulk_job_id,
		},
		webhook: {
			on_each_email: {
				url: `${getWebappURL()}/api/v1/bulk/webhook`,
				headers: {
					"x-reacher-secret": process.env.RCH_HEADER_SECRET,
				},
				extra: {
					bulkEmailId: bulkEmail.id,
					userId,
					endpoint: "/v1/bulk",
				},
			},
		},
	};
}
