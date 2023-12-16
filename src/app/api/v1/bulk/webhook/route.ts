import { CheckEmailOutput } from "@reacherhq/api";
import { supabaseAdmin } from "@/util/supabaseServer";
import { NextRequest } from "next/server";
import { removeSensitiveData } from "@/util/api";
import { Tables } from "@/supabase/database.types";

export interface WebhookExtra {
	bulkEmailId: string;
	userId: string;
	endpoint: string;
}

export interface WebhookPayload {
	output: CheckEmailOutput;
	extra: WebhookExtra;
}

export const POST = async (req: NextRequest): Promise<Response> => {
	if (req.headers.get("x-reacher-secret") !== process.env.RCH_HEADER_SECRET) {
		return Response.json({ error: "Invalid header secret" });
	}

	const body: WebhookPayload = await req.json();
	const { output, extra } = body;

	// Add to supabase calls
	const res1 = await supabaseAdmin
		.from<Tables<"calls">>("calls")
		.insert({
			endpoint: extra.endpoint,
			user_id: extra.userId,
			backend: output.debug?.server_name,
			domain: output.syntax.domain,
			duration: Math.round(
				(output.debug?.duration.secs || 0) * 1000 +
					(output.debug?.duration.nanos || 0) / 1000000
			),
			is_reachable: output.is_reachable,
			verif_method: output.debug?.smtp?.verif_method?.type,
			result: removeSensitiveData(output),
		})
		.select("*");
	if (res1.error) {
		return Response.json(res1.error, res1);
	}

	// Update bulk_emails table
	const res2 = await supabaseAdmin
		.from("bulk_emails")
		.update({ call_id: res1.data[0].id })
		.eq("id", extra.bulkEmailId);
	if (res2.error) {
		return Response.json(res2.error, res2);
	}

	return Response.json({ message: "ok" }, { status: 200 });
};
