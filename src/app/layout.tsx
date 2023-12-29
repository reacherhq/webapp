import "./global.css";
import "./geist.gen.css";

import { GeistProvider, myTheme } from "@/components/Geist";
import Script from "next/script";
import { Crisp } from "@/components/Crisp";

export const metadata = {
	title: "Reacher Email Verification",
	description:
		"Reacher is a simple, fast, accurate email verification tool to reduce your bounce rate and avoid spam sign-ups. We check SMTP responses, MX records, catch-all and disposable addresses.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html>
			<head>
				<meta charSet="utf-8" />
				<link rel="icon" href="/favicon.png" sizes="any" />
			</head>
			<body>
				<GeistProvider themes={[myTheme]} themeType="default">
					{children}
				</GeistProvider>
				<Crisp />
				<Script
					async
					src="https://scripts.simpleanalyticscdn.com/latest.js"
				/>
				<Script
					async
					src="https://scripts.simpleanalyticscdn.com/auto-events.js"
				></Script>
				<Script
					async
					src="/js/simpleanalytics.js"
					type="text/javascript"
				></Script>
			</body>
		</html>
	);
}
