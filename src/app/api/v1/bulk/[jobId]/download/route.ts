import { supabaseAdmin } from "@/util/supabaseServer";
import { sentryException } from "@/util/sentry";
import { checkUserInDB, isEarlyResponse } from "@/util/api";
import { Database } from "@/supabase/database.types";
import { CheckEmailOutput } from "@reacherhq/api";
import { components } from "@reacherhq/api/lib/types";
import { NextRequest } from "next/server";

type ArrayElement<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never;
type SmtpD = components["schemas"]["SmtpDetails"];
type MiscD = components["schemas"]["MiscDetails"];
type MxD = components["schemas"]["MxDetails"];
type ReacherError = components["schemas"]["Error"];

export const GET = async (
	req: NextRequest,
	{
		params,
	}: {
		params: { jobId: string };
	}
): Promise<Response> => {
	// TODO Remove this once we allow Bulk.
	if (process.env.VERCEL_ENV === "production") {
		return Response.json(
			{ error: "Not available in production" },
			{ status: 403 }
		);
	}

	try {
		const { user } = await checkUserInDB(req);
		if (!user) {
			return Response.json(
				{
					error: "User not found",
				},
				{
					status: 401,
				}
			);
		}

		const { jobId } = params;

		const res = await supabaseAdmin
			.rpc<
				ArrayElement<
					Database["public"]["Functions"]["get_bulk_results"]["Returns"]
				>
			>("get_bulk_results", { id_param: jobId })
			.select("*");
		if (res.error) {
			return Response.json(
				{
					error: res.error.message,
				},
				res
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
				["mx.records"]: (result.mx as MxD)?.records,
				["mx.error"]: formatCsvError(result.mx),
				// Syntax
				["syntax.is_valid_syntax"]: result.syntax.is_valid_syntax,
				["syntax.domain"]: result.syntax.domain,
				["syntax.username"]: result.syntax.username,
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
		}`;
	}

	return null;
}
