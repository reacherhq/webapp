import axios, { AxiosError, AxiosResponse } from "axios";
import { NextApiResponse } from "next";
import { RateLimiterRes } from "rate-limiter-flexible";
import retry from "async-retry";

// Gets the currently depoloyed URL.
export const getWebappURL = (): string => {
	const url =
		// NEXT_PUBLIC_DEPLOY_MAIN_URL has been set to app.reacher.email for production only.
		process?.env?.NEXT_PUBLIC_DEPLOY_MAIN_URL &&
		process.env.NEXT_PUBLIC_DEPLOY_MAIN_URL !== ""
			? process.env.NEXT_PUBLIC_DEPLOY_MAIN_URL
			: process?.env?.URL && process.env.URL !== ""
			? process.env.URL
			: process?.env?.VERCEL_URL && process.env.VERCEL_URL !== ""
			? process.env.VERCEL_URL
			: "http://localhost:3000";

	return url.includes("http") ? url : `https://${url}`;
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
		return await retry(
			async () => {
				const { data: res } = await axios.post<T, AxiosResponse<T>>(
					url,
					data,
					{
						headers: {
							"Content-Type": "application/json",
							token,
							Authorization: token,
						},
						withCredentials: true,
					}
				);

				return res;
			},
			{
				retries: 2,
			}
		);
	} catch (err) {
		throw convertAxiosError(err as AxiosError);
	}
};

// Converts an AxiosError to a regular Error with nice formatting.
export function convertAxiosError(err: AxiosError): Error {
	if (err instanceof AxiosError) {
		// Inspired by https://stackoverflow.com/questions/49967779/axios-handling-errors
		let m: string;
		if (err.response) {
			// Request made and server responded
			m = `[${err.response.status?.toString()}] ${JSON.stringify(
				err.response.data
			)} ${err.message}`; // eslint-disable-line
		} else if (err.request) {
			// The request was made but no response was received
			m = "Error in request, no response received: " + err.message;
		} else {
			// Something happened in setting up the request that triggered an Error
			m = "Error: " + err.message;
		}

		throw m ? new Error(m) : err;
	} else {
		throw err;
	}
}

export const toDateTime = (secs: number): Date => {
	const t = new Date("1970-01-01T00:30:00Z"); // Unix epoch start.
	t.setSeconds(secs);

	return t;
};

// Parse a URL hash, taken from window.location.hash.
// In our case, window.location.hash is of format:
// '#access_token={JWT}&expires_in=3600&refresh_token={TOKEN}&token_type=bearer&type=recovery'
export function parseHashComponents(hash: string): Record<string, string> {
	return hash
		.slice(1)
		.split("&")
		.reduce((acc, c) => {
			const [key, value] = c.split("=");
			acc[key] = value;

			return acc;
		}, {} as Record<string, string>);
}
