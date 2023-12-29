"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";

export default function GlobalError({
	error,
}: {
	error: Error & { digest?: string };
}) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html>
			<body>
				<h2>
					Something went wrong. Please email a screenshot of this page
					to amaury@reacher.email, thank you!
				</h2>
				<p>Error: {JSON.stringify(error)}</p>
				<p>{error.digest}</p>
			</body>
		</html>
	);
}
