import { sentryException } from "@/util/sentry";
import { isEarlyResponse } from "@/app/api/v0/check_email/checkUserInDb";
import { CheckEmailOutput } from "@reacherhq/api";
import { components } from "@reacherhq/api/lib/types";
import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

type SmtpD = components["schemas"]["SmtpDetails"];
type MiscD = components["schemas"]["MiscDetails"];
type MxD = components["schemas"]["MxDetails"];
type ReacherError = components["schemas"]["Error"];

export const GET = async (
	_req: NextRequest,
	{
		params,
	}: {
		params: { jobId: string };
	}
): Promise<Response> => {
	try {
		const cookieStore = cookies();
		const supabase = createClient(cookieStore);

		const { jobId } = params;
		const id_param = parseInt(jobId, 10);

		const res = await supabase
			.rpc("get_bulk_results", { id_param })
			.select("*");
		if (res.error) {
			return Response.json(
				{
					error: res.error.message,
				},
				res
			);
		}

		if (!res.data.length) {
			return Response.json(
				{
					error: "No results found",
				},
				{
					status: 404,
				}
			);
		}

		const rows = res.data.map((row) => {
			const result = row.result as CheckEmailOutput;
			result.misc;
			return {
				reacher_email_id: row.id,
				email: row.email,
				is_reachable: row.is_reachable,
				// Smtp
				["smtp.can_connect_smtp"]: (result.smtp as SmtpD)
					?.can_connect_smtp,
				["smtp.has_full_inbox"]: (result.smtp as SmtpD)?.has_full_inbox,
				["smtp.is_catch_all"]: (result.smtp as SmtpD)?.is_catch_all,
				["smtp.is_deliverable"]: (result.smtp as SmtpD)?.is_deliverable,
				["smtp.is_disabled"]: (result.smtp as SmtpD).is_disabled,
				["smtp.error"]: formatCsvError(result.smtp),
				// Misc
				["misc.is_disposable"]: (result.misc as MiscD)?.is_disposable,
				["misc.is_role_account"]: (result.misc as MiscD)
					?.is_role_account,
				["misc.gravatar_url"]: (result.misc as MiscD)?.gravatar_url,
				["misc.error"]: formatCsvError(result.misc),
				// Mx
				["mx.accepts_mail"]: (result.mx as MxD)?.accepts_mail,
				["mx.records"]: (result.mx as MxD)?.records.join(";"), // Don't join using commas, to avoid messing up with CSV
				["mx.error"]: formatCsvError(result.mx),
				// Syntax
				["syntax.is_valid_syntax"]: result.syntax.is_valid_syntax,
				["syntax.domain"]: result.syntax.domain,
				["syntax.username"]: result.syntax.username,
				// Debug
				["debug.smtp.verif_method"]:
					result.debug?.smtp?.verif_method?.type,
			};
		});

		// Convert to CSV
		const header = Object.keys(rows[0]);
		const csv = [
			header.join(","), // header row first
			...rows.map((row) =>
				header
					.map((fieldName) =>
						JSON.stringify(row[fieldName as keyof typeof row])
					)
					.join(",")
			),
		].join("\r\n");

		return new Response(csv, {
			headers: {
				"Content-Type": "text/csv",
				"Content-Disposition": `attachment; filename="bulkjob_${jobId}_results.csv"`,
			},
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

function formatCsvError(err: unknown): string | null {
	if ((err as ReacherError)?.type && (err as ReacherError)?.message) {
		return `${(err as ReacherError).type}: ${
			(err as ReacherError).message
		}`.replaceAll(",", ";"); // Don't use commas to avoid messing up with CSV
	}

	return null;
}
