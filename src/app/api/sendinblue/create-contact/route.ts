import { CreateUpdateContactModel } from "@sendinblue/client";
import type { User } from "@supabase/supabase-js";
import { sendinblueApi } from "@/util/sendinblue";
import { sentryException } from "@/util/sentry";
import { getUser, supabaseAdmin } from "@/supabase/supabaseAdmin";
import { NextRequest } from "next/server";

export const POST = async (req: NextRequest): Promise<Response> => {
	try {
		const token = req.headers.get("Authorization");
		if (typeof token !== "string") {
			throw new Error("Expected API token in the Authorization header.");
		}

		const user = await getUser(token);
		if (!user) {
			return Response.json({ error: "User not found" }, { status: 401 });
		}

		const { body } = await sendinblueApi.createContact({
			email: user.email,
			attributes: {
				WEBAPP_ENV:
					process.env.VERCEL_ENV === "production"
						? "production"
						: "staging",
				SUPABASE_UUID: user.id,
			},
			listIds: [7], // List #7 is the Reacher sign up contact list.
		});

		await updateUserSendinblueContactId(user, body);

		return Response.json({ ok: true });
	} catch (err) {
		sentryException(err as Error);
		return Response.json(
			{
				error: (err as Error).message,
			},
			{ status: 500 }
		);
	}
};

/**
 * Update the Sendinblue contact id for the given user.
 */
async function updateUserSendinblueContactId(
	user: User,
	body: CreateUpdateContactModel
): Promise<void> {
	if (!body.id) {
		sentryException(
			new Error(
				`Got invalid body for Sendinblue create contact: ${JSON.stringify(
					body
				)}`
			)
		);
		return;
	}

	await supabaseAdmin
		.from("users")
		.update({
			sendinblue_contact_id: body.id.toString(),
		})
		.eq("id", user.id);
}
