"use client";

import { Button } from "@geist-ui/react";
import logo from "../assets/logo/reacher-512.png";
import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
	return (
		<html>
			<body>
				<div
					className="container text-center"
					style={{ paddingTop: 200 }}
				>
					<Image alt="logo" src={logo} width={64} />
					<h1>404</h1>
					<p>
						Something went wrong. Please email a screenshot of this
						page to amaury@reacher.email, thank you!
					</p>
					<Link href="/">
						<Button type="secondary">Go home</Button>
					</Link>
				</div>
			</body>
		</html>
	);
}
