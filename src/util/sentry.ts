import { captureException } from "@sentry/nextjs";

/**
 * Capture an  error, and send it to Sentry.
 *
 * @param err - The error to capture.
 */
export function sentryException(err: unknown): void {
	console.error(err);

	captureException(err);
}
