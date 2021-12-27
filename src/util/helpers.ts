import axios, { AxiosError, AxiosResponse } from 'axios';

// Gets the currently depoloyed URL.
export const getURL = (): string => {
	const url =
		// DEPLOY_MAIN_URL has been set to app.reacher.email for production only.
		process?.env?.DEPLOY_MAIN_URL && process.env.DEPLOY_MAIN_URL !== ''
			? process.env.DEPLOY_MAIN_URL
			: process?.env?.URL && process.env.URL !== ''
			? process.env.URL
			: process?.env?.VERCEL_URL && process.env.VERCEL_URL !== ''
			? process.env.VERCEL_URL
			: 'http://localhost:3000';

	return url.includes('http') ? url : `https://${url}`;
};

export const postData = async <T = unknown>({
	url,
	token,
	data,
}: {
	url: string;
	token: string;
	data?: unknown;
}): Promise<T> => {
	try {
		const { data: res } = await axios.post<T, AxiosResponse<T>>(url, data, {
			headers: { 'Content-Type': 'application/json', token },
			withCredentials: true,
		});

		return res;
	} catch (err) {
		if ((err as AxiosError).response?.data) {
			throw new Error(
				(err as AxiosError<{
					error: string;
				}>).response?.data.error
			);
		} else {
			throw err;
		}
	}
};

export const toDateTime = (secs: number): Date => {
	const t = new Date('1970-01-01T00:30:00Z'); // Unix epoch start.
	t.setSeconds(secs);

	return t;
};

// Parse a URL hash, taken from window.location.hash.
// In our case, window.location.hash is of format:
// '#access_token={JWT}&expires_in=3600&refresh_token={TOKEN}&token_type=bearer&type=recovery'
export function parseHashComponents(hash: string): Record<string, string> {
	return hash
		.slice(1)
		.split('&')
		.reduce((acc, c) => {
			const [key, value] = c.split('=');
			acc[key] = value;

			return acc;
		}, {} as Record<string, string>);
}
