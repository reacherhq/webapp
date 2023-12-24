import { NextRequest } from "next/server";
import amqplib from "amqplib";
import { getUser, supabaseAdmin } from "@/util/supabaseServer";
import { sentryException } from "@/util/sentry";
import { getWebappURL } from "@/util/helpers";
import { checkUserInDB, isEarlyResponse } from "@/util/api";
import { SAAS_100K_PRODUCT_ID } from "@/util/subs";

interface BulkPayload {
	input_type: "array";
	input: string[];
}

export const GET = async (req: NextRequest): Promise<Response> => {
	// TODO Remove this once we allow Bulk.
	if (process.env.VERCEL_ENV === "production") {
		return Response.json(
			{ error: "Not available in production" },
			{ status: 403 }
		);
	}

	try {
		const token =
			req.headers.get("authorization") ||
			req.headers.get("Authorization");
		if (typeof token !== "string") {
			throw new Error("Expected API token in the Authorization header.");
		}

		const user = await getUser(token);
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

		const {
			params: { jobId },
		}: { params: { jobId: string } } = req;

		const payload: BulkPayload = await req.json();

		const res = await supabaseAdmin.

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
