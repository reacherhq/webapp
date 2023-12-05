import type { CheckEmailInput, CheckEmailOutput } from '@reacherhq/api';
import axios, { AxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 } from 'uuid';

import { checkUserInDB, cors } from '../../../util/api';
import { getReacherBackends, ReacherBackend } from '../../../util/backend';
import { updateSendinblue } from '../../../util/sendinblue';
import { sentryException } from '../../../util/sentry';
import { SupabaseCall, SupabaseUser } from '../../../util/supabaseClient';
import { supabaseAdmin } from '../../../util/supabaseServer';

// Reacher only exposes one endpoint right now, so we're hardcoding it.
const ENDPOINT = `/v0/check_email`;

const checkEmail = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> => {
	// Run cors
	await cors(req, res);

	if (req.method !== 'POST') {
		res.setHeader('Allow', 'POST');
		res.status(405).json({ error: 'Method Not Allowed' });
		return;
	}

	const { user, sentResponse } = await checkUserInDB(req, res);
	if (sentResponse) {
		return;
	}

	try {
		await tryAllBackends(req, res, user);

		// Update the LAST_API_CALL field in Sendinblue.
		await updateSendinblue(user);
	} catch (err) {
		sentryException(err as Error);
		res.status(500).json({
			error: (err as Error).message,
		});
	}
};

export default checkEmail;

// Vercel functions time out after 30s.
const VERCEL_TIMEOUT = 30_000; // ms

/**
 * Forwards the Next.JS request to Reacher's backends, try them all in the
 * order given by `RCH_BACKENDS` env variable.
 */
async function tryAllBackends(
	req: NextApiRequest,
	res: NextApiResponse,
	user: SupabaseUser
) {
	try {
		// The final result to return.
		let result: CheckEmailOutput;

		// Just before Vercel times out, we'll return the response from the
		// last backend call (even if it's unknown). This is because we prefer
		// to return an unknown result than a timeout error.
		const t = setTimeout(() => {
			if (result) {
				return res.status(200).json(result);
			}
		}, VERCEL_TIMEOUT - 2000);

		const reacherBackends = getReacherBackends();

		// Create a unique UUID for each verification. The purpose of this
		// verificationId is that we insert one row in the `calls` table per
		// backend call. However, if we try the backends sequentially, we don't
		// want to charge the user 2 credits for 1 email verification.
		const verificationId = v4();

		// Note that we don't loop the last element of reacherBackends. That
		// one gets treated specially, as we'll always return its response.
		for (let i = 0; i < reacherBackends.length - 1; i++) {
			try {
				result = await makeSingleBackendCall(
					verificationId,
					reacherBackends[i],
					req,
					user
				);

				if (result.is_reachable !== 'unknown') {
					return res.status(200).json(result);
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
			reacherBackends[reacherBackends.length - 1],
			req,
			user
		);

		clearTimeout(t);
		return res.status(200).json(result);
	} catch (err) {
		const statusCode = (err as AxiosError).response?.status;
		if (!statusCode) {
			throw err;
		}

		return res.status(statusCode).json({
			error: (err as AxiosError).response?.data,
		});
	}
}

/**
 * Make a single call to the backend, and log some metadata to the DB.
 */
async function makeSingleBackendCall(
	verificationId: string,
	reacherBackend: ReacherBackend,
	req: NextApiRequest,
	user: SupabaseUser
): Promise<CheckEmailOutput> {
	// Measure the API request time.
	const startDate = new Date();

	// Send an API request to Reacher backend, which handles email
	// verifications, see https://github.com/reacherhq/backend.
	const result = await axios.post<CheckEmailOutput>(
		`${reacherBackend.url}${ENDPOINT}`,
		req.body,
		{
			headers: {
				'x-reacher-secret': process.env.RCH_HEADER_SECRET || '',
			},
		}
	);

	const endDate = new Date();

	// Get the domain of the email, i.e. the part after '@'.
	const email = req.body as CheckEmailInput;
	const parts = email.to_email.split('@');
	const domain = parts && parts[1];

	// If successful, also log an API call entry in the database.
	const { error } = await supabaseAdmin.from<SupabaseCall>('calls').insert({
		endpoint: ENDPOINT,
		user_id: user.id,
		backend: reacherBackend.name,
		backend_ip:
			reacherBackend.ip ||
			// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
			(result.request?.socket?.remoteAddress as string),
		domain,
		verification_id: verificationId,
		duration: endDate.getTime() - startDate.getTime(), // In ms.
		is_reachable: result.data.is_reachable,
		verif_method: result.data.debug?.smtp?.verif_method?.type,
	});

	if (error) throw error;

	return result.data;
}
