import { NextApiRequest, NextApiResponse } from 'next';

import { cors } from '../../../../backend/api';

const POST = async (
	req: NextApiRequest,
	res: NextApiResponse
): Promise<void> => {
	// Run cors
	await cors(req, res);
};

export default POST;
