import { NextApiRequest, NextApiResponse } from 'next';

import { checkUserInDB, cors } from '../../../../util/api';
import { updateSendinblue } from '../../../../util/sendinblue';
import { sentryException } from '../../../../util/sentry';

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

	try {
		const { user, resWasSent } = await checkUserInDB(req, res);
		if (resWasSent || !user) {
			return;
		}

		//TODO

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
