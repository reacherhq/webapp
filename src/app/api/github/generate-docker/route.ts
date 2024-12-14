import { createClient } from "@/supabase/server";
import { getUserDetails } from "@/supabase/supabaseServer";
import { cookies } from "next/headers";
import axios, { AxiosError } from "axios";
import { convertAxiosError } from "@/util/helpers";

export async function POST(): Promise<Response> {
	try {
		const cookieStore = cookies();
		const supabase = createClient(cookieStore);
		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			return Response.json({ error: "User not found" }, { status: 401 });
		}

		const userDetails = await getUserDetails();

		await axios.post(
			"https://api.github.com/repos/reacherhq/admin/actions/workflows/commercial_license_trial.yml/dispatches",
			{
				ref: "main",
				inputs: {
					RCH__SUPABASE__USER_ID: user.id,
					RCH__COMMERCIAL_LICENSE_TRIAL__URL:
						"https://api.reacher.email/v1/commercial_license_trial",
					RCH__COMMERCIAL_LICENSE_TRIAL__API_TOKEN:
						userDetails.api_token,
				},
			},
			{
				headers: {
					Accept: "application/vnd.github+json",
					Authorization: `Bearer ${process.env.GH_TRIAL_GENERATE_DOCKER_ACCESS_TOKEN}`,
				},
			}
		);

		return Response.json({ ok: true });
	} catch (err) {
		const error = convertAxiosError(err as AxiosError);
		return Response.json(
			{ error: (error as Error).message },
			{ status: (err as AxiosError).status || 500 }
		);
	}
}
