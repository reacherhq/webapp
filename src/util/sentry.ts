import { captureException } from '@sentry/browser';

/**
 * Capture an  error, and send it to Sentry.
 *
 * @param err - The error to capture.
 */
export function sentryException(err: Error): void {
	if (typeof window === 'undefined') {
		return;
	}
	console.error(err);
	captureException(err);
}
