import { CheckEmailOutput } from "@reacherhq/api";
import { NextApiRequest, NextApiResponse } from "next";

import { SupabaseCall } from "@/util/supabaseClient";
import { supabaseAdmin } from "@/util/supabaseServer";

export interface WebhookExtra {
	userId: string;
	endpoint: string;
	verificationId: string;
}

export interface WebhookPayload {
	output: CheckEmailOutput;
	extra: WebhookExtra;
}

const POST = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> => {
	if (req.method !== "POST") {
		res.setHeader("Allow", "POST");
		res.status(405).json({ error: "Method Not Allowed" });
		return;
	}

	if (req.headers["x-reacher-secret"] !== process.env.RCH_HEADER_SECRET) {
		res.status(403).json({ error: "Invalid header secret" });
		return;
	}

	const { extra, output } = req.body as WebhookPayload;

	// Add to supabase
	const response = await supabaseAdmin.from<SupabaseCall>("calls").insert({
		endpoint: extra.endpoint,
		user_id: extra.userId,
		backend: output.debug?.server_name,
		domain: output.syntax.domain,
		verification_id: extra.verificationId,
		duration: Math.round(
			(output.debug?.duration.secs || 0) * 1000 +
				(output.debug?.duration.nanos || 0) / 1000000
		),
		is_reachable: output.is_reachable,
		verif_method: output.debug?.smtp?.verif_method?.type,
		result: removeSensitiveData(output),
	});
	if (response.error) {
		res.status(response.status).json(response.error);
		return;
	}

	res.status(200).json({ message: "ok" });
};

export default POST;

// Remove sensitive data before storing to DB.
function removeSensitiveData(output: CheckEmailOutput): CheckEmailOutput {
	const newOutput = { ...output };

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	delete newOutput.debug?.server_name;

	return newOutput;
}
