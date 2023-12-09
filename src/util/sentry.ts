import { captureException } from "@sentry/browser";

/**
 * Capture an  error, and send it to Sentry.
 *
 * @param err - The error to capture.
 */
export function sentryException(err: Error): void {
	console.error(err);

	captureException(err);
}
