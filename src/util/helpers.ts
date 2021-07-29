import { PostgrestError } from '@supabase/supabase-js';
import axios, { AxiosError } from 'axios';

export const getURL = (): string => {
	const url =
		process?.env?.URL && process.env.URL !== ''
			? process.env.URL
			: process?.env?.VERCEL_URL && process.env.VERCEL_URL !== ''
			? process.env.VERCEL_URL
			: 'http://localhost:3000';

	return url.includes('http') ? url : `https://${url}`;
};

export const getData = async <T = unknown>({
	url,
	token,
}: {
	url: string;
	token?: string;
	data?: unknown;
}): Promise<T> => {
	const { data: res } = await axios.get<T>(url, {
		headers: { 'Content-Type': 'application/json', token },
		withCredentials: true,
	});

	return res;
};

export const postData = async <T = unknown>({
	url,
	token,
	data,
}: {
	url: string;
	token?: string;
	data?: unknown;
}): Promise<T> => {
	try {
		const { data: res } = await axios.post<T>(url, data, {
			headers: { 'Content-Type': 'application/json', token },
			withCredentials: true,
		});

		return res;
	} catch (err) {
		if ((err as AxiosError).response?.data) {
			throw (err as AxiosError<{ error: PostgrestError }>).response?.data
				.error;
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

/**
 * Like Promise.all, but with max concurrency.
 *
 * @see https://gist.github.com/jcouyang/632709f30e12a7879a73e9e132c0d56b#gistcomment-3253738
 */
export async function promiseAllLimit<T>(
	n: number,
	list: (() => Promise<T>)[]
): Promise<T[]> {
	const head = list.slice(0, n);
	const tail = list.slice(n);
	const result: T[] = [];
	const execute = async (
		promise: () => Promise<T>,
		i: number,
		runNext: () => Promise<void>
	) => {
		result[i] = await promise();
		await runNext();
	};
	const runNext = async () => {
		const i = list.length - tail.length;
		const promise = tail.shift();
		if (promise !== undefined) {
			await execute(promise, i, runNext);
		}
	};
	await Promise.all(head.map((promise, i) => execute(promise, i, runNext)));

	return result;
}
