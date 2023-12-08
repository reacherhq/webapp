import type { CheckEmailInput, CheckEmailOutput } from '@reacherhq/api';
import { PostgrestError } from '@supabase/supabase-js';
import axios, { Axios, AxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { v4 } from 'uuid';

import { checkUserInDB, cors } from '../../../util/api';
import { convertAxiosError } from '../../../util/helpers';
import { updateSendinblue } from '../../../util/sendinblue';
import { sentryException } from '../../../util/sentry';
import { SupabaseCall } from '../../../util/supabaseClient';
import { supabaseAdmin } from '../../../util/supabaseServer';
import { WebhookExtra } from '../calls/webhook';

const ORCHESTRATOR_URL = process.env.RCH_ORCHESTRATOR_URL as string;
const TIMEOUT = 30000;

const POST = async (
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
		const verificationId = v4();
		try {
			await axios.post(
				`${ORCHESTRATOR_URL}/v0/check_email`,
				{
					input: req.body as CheckEmailInput,
					webhook: {
						url: 'http://localhost:3000/api/calls/webhook',
						extra: {
							userId: user.id,
							endpoint: '/v0/check_email',
							verificationId: verificationId,
						} as WebhookExtra,
					},
				},
				{}
			);
		} catch (err) {
			throw convertAxiosError(err as AxiosError);
		}

		// Poll the database to make sure the call was added.
		let checkEmailOutput: CheckEmailOutput | undefined;
		let lastError: PostgrestError | Error | null = new Error(
			'Timeout verifying email.'
		);

		const startTime = Date.now();
		while (!checkEmailOutput && Date.now() - startTime < TIMEOUT - 2000) {
			console.log(
				'Polling database for verification result...',
				Date.now() - startTime
			);
			await new Promise((resolve) => setTimeout(resolve, 500));

			const response = await supabaseAdmin
				.from<SupabaseCall>('calls')
				.select('*')
				.eq('verification_id', verificationId)
				.single();

			// If there's no error, it means the result has been added to the
			// database.
			if (!response.error) {
				lastError = null;
				checkEmailOutput = response.data.result;
				break;
			}
		}

		if (lastError) {
			res.status(500).json({
				...lastError,
				error: lastError.message,
			});
			return;
		}

		if (!checkEmailOutput) {
			res.status(500).json({
				error: 'Column result was not populated.',
			});
			return;
		}

		res.status(200).json(checkEmailOutput);

		// Update the LAST_API_CALL field in Sendinblue.
		await updateSendinblue(user);
	} catch (err) {
		sentryException(err as Error);
		res.status(500).json({
			error: (err as Error).message,
		});
	}
};

export default POST;
