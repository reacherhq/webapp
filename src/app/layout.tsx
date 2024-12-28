import "./global.css";
import "./geist.gen.css";

import { GeistProvider, myTheme } from "@/components/Geist";
import Script from "next/script";

export const metadata = {
	title: {
		template: "%s | Reacher Email Verification",
		default: "Reacher Email Verification",
	},
	description:
		"Reacher is an open-source, fast, and accurate email verification tool designed to reduce bounce rates and prevent spam sign-ups. It checks SMTP responses, MX records, catch-all, and disposable addresses for reliable results.",
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
				<Script
					async
					src="/js/brevo.js"
					type="text/javascript"
				></Script>
			</body>
		</html>
	);
}
