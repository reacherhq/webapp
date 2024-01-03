import { v4 } from "uuid";
import axios, { AxiosError } from "axios";
import { supabaseAdmin } from "@/supabase/supabaseAdmin";
import { CheckEmailInput, CheckEmailOutput } from "@reacherhq/api";
import { Tables } from "@/supabase/database.types";

// Vercel functions time out after 60s.
const VERCEL_TIMEOUT = 90_000; // ms

interface ReacherBackend {
	url: string;
	name: string;
}

const RCH_BACKENDS = [
	{
		url: "http://backend1.reacher.dev",
		name: "backend1-ovh",
	},
	{
		url: "http://backend3.reacher.dev",
		name: "backend3-do",
	},
];

/**
 * Forwards the Next.JS request to Reacher's backends, try them all in the
 * order given by `RCH_BACKENDS`.
 */
export async function tryAllBackends(
	emailInput: CheckEmailInput,
	user: Tables<"users">
): Promise<Response> {
	try {
		// The final result to return.
		let result: CheckEmailOutput;

		let t: NodeJS.Timeout | undefined;

		async function makeBackendCalls(): Promise<Response> {
			// Create a unique UUID for each verification. The purpose of this
			// verificationId is that we insert one row in the `calls` table per
			// backend call. However, if we try the backends sequentially, we don't
			// want to charge the user 2 credits for 1 email verification.
			const verificationId = v4();

			// Note that we don't loop the last element of reacherBackends. That
			// one gets treated specially, as we'll always return its response.
			for (let i = 0; i < RCH_BACKENDS.length - 1; i++) {
				try {
					result = await makeSingleBackendCall(
						verificationId,
						RCH_BACKENDS[i],
						emailInput,
						user
					);

					if (result.is_reachable !== "unknown") {
						return Response.json(result);
					}
				} catch {
					// Continue loop
				}
			}

			// If we arrive here, it means all previous backend calls errored or
			// returned "unknown". We make the last backend call, and always return
			// its response.
			result = await makeSingleBackendCall(
				verificationId,
				RCH_BACKENDS[RCH_BACKENDS.length - 1],
				emailInput,
				user
			);

			return Response.json(result);
		}

		const res = await Promise.race([
			makeBackendCalls(),
			new Promise<Response>((resolve) => {
				t = setTimeout(() => {
					return resolve(
						Response.json(
							{
								error: `The email ${emailInput.to_email} can't be verified within 90s. This is because the email provider imposes obstacles to prevent real-time email verification, such as greylisting. Please try again later.`,
							},
							{ status: 504 }
						)
					);
				}, VERCEL_TIMEOUT);
			}),
		]);

		if (t) {
			clearTimeout(t);
		}

		return res;
	} catch (err) {
		const statusCode = (err as AxiosError).response?.status;
		if (!statusCode) {
			throw err;
		}

		return Response.json(
			{
				error: (err as AxiosError).response?.data,
			},
			{
				status: statusCode,
			}
		);
	}
}

/**
 * Make a single call to the backend, and log some metadata to the DB.
 */
async function makeSingleBackendCall(
	verificationId: string,
	reacherBackend: ReacherBackend,
	emailInput: CheckEmailInput,
	user: Tables<"users">
): Promise<CheckEmailOutput> {
	// Measure the API request time.
	const startDate = new Date();

	// Send an API request to Reacher backend, which handles email
	// verifications, see https://github.com/reacherhq/backend.
	const result = await axios.post<CheckEmailOutput>(
		`${reacherBackend}/v0/check_email`,
		emailInput,
		{
			headers: {
				"x-reacher-secret": process.env.RCH_HEADER_SECRET || "",
			},
		}
	);

	const endDate = new Date();

	// Get the domain of the email, i.e. the part after '@'.

	const parts = emailInput.to_email.split("@");
	const domain = parts && parts[1];

	// If successful, also log an API call entry in the database.
	const { error } = await supabaseAdmin.from("calls").insert({
		endpoint: "/v0/check_email",
		user_id: user.id,
		backend: reacherBackend.name,
		backend_ip: result.request?.socket?.remoteAddress as string,
		domain,
		verification_id: verificationId,
		duration: endDate.getTime() - startDate.getTime(), // In ms.
		is_reachable: result.data.is_reachable,
		verif_method: result.data.debug?.smtp?.verif_method?.type,
	});

	if (error) throw error;

	return result.data;
}
