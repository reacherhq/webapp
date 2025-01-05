import { CheckEmailOutput } from "@reacherhq/api";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";
import { NextRequest } from "next/server";
import { removeSensitiveData } from "@/app/api/v0/check_email/checkUserInDb";

export interface WebhookExtra {
	bulkEmailId: number;
	userId: string;
	endpoint: string;
}

export interface WebhookPayload {
	result: CheckEmailOutput;
	extra: WebhookExtra;
}

export const POST = async (req: NextRequest): Promise<Response> => {
	if (req.headers.get("x-reacher-secret") !== process.env.RCH_HEADER_SECRET) {
		return Response.json({ error: "Invalid header secret" });
	}

	const body: WebhookPayload = await req.json();
	const { result, extra } = body;

	// Add to supabase calls
	const res1 = await supabaseAdmin
		.from("calls")
		.insert({
			endpoint: extra.endpoint,
			user_id: extra.userId,
			backend: result.debug?.server_name,
			domain: result.syntax.domain,
			duration: Math.round(
				(result.debug?.duration.secs || 0) * 1000 +
					(result.debug?.duration.nanos || 0) / 1000000
			),
			is_reachable: result.is_reachable,
			verif_method: result.debug?.smtp?.verif_method?.type,
			result: removeSensitiveData(result),
			bulk_email_id: extra.bulkEmailId,
		})
		.select("*");
	if (res1.error) {
		return Response.json(res1.error, res1);
	}

	return Response.json({ ok: true }, { status: 200 });
};
