import axios, { AxiosError, AxiosResponse } from 'axios';
import { NextApiResponse } from 'next';
import { RateLimiterRes } from 'rate-limiter-flexible';

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
				(
					err as AxiosError<{
						error: string;
					}>
				).response?.data.error
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

/**
 * Sets the Rate Limit headers on the response.
 *
 * @param res - The NextJS API response.
 * @param rateLimiterRes - The response object from rate-limiter-flexible.
 * @param limit - The limit per interval.
 */
export function setRateLimitHeaders(
	res: NextApiResponse,
	rateLimiterRes: RateLimiterRes,
	limit: number
): void {
	const headers = {
		'Retry-After': rateLimiterRes.msBeforeNext / 1000,
		'X-RateLimit-Limit': limit,
		// When I first introduced rate limiting, some users had used for than
		// 10k emails per month. Their remaining showed e.g. -8270. We decide
		// to show 0 in these cases, hence the Math.max.
		'X-RateLimit-Remaining': Math.max(0, rateLimiterRes.remainingPoints),
		'X-RateLimit-Reset': new Date(
			Date.now() + rateLimiterRes.msBeforeNext
		).toISOString(),
	};

	Object.keys(headers).forEach((k) =>
		res.setHeader(k, headers[k as keyof typeof headers])
	);
}
