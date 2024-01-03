"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
import { useEffect } from "react";
import logo from "../assets/logo/reacher-64.png";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@geist-ui/react";

export default function GlobalError({
	error,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		Sentry.captureException(error);
	}, [error]);

	return (
		<html>
			<body>
				<div className="container text-center">
					<Image alt="logo" src={logo} />
					<h2>
						Something went wrong. Please email a screenshot of this
						page to amaury@reacher.email, thank you!
					</h2>
					<p>Error: {JSON.stringify(error)}</p>
					<p>{error.digest}</p>
					<Link href="/">
						<Button type="secondary">Go home</Button>
					</Link>
				</div>
			</body>
		</html>
	);
}
