import "./global.css";
import "./geist.gen.css";
import "@mantine/core/styles.css";

import { GeistProvider, myTheme } from "@/components/Geist";
import Script from "next/script";
import { createTheme, MantineProvider } from "@mantine/core";

export const metadata = {
	title: {
		template: "%s | Reacher Email Verification",
		default: "Reacher Email Verification",
	},
	description:
		"Reacher is an open-source, fast, and accurate email verification tool designed to reduce bounce rates and prevent spam sign-ups. It checks SMTP responses, MX records, catch-all, and disposable addresses for reliable results.",
};

const mantineTheme = createTheme({
	black: "#3a3a3a",
	colors: {
		purple: [
			// https://mantine.dev/colors-generator/?color=605acc
			"#efeeff",
			"#dcdaf9",
			"#b5b3ea",
			"#8d89dc",
			"#6b65cf",
			"#554fc8",
			"#4943c6",
			"#3b35af",
			"#332f9e",
			"#29278c",
		],
	},
	primaryColor: "purple",
});

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
					<MantineProvider theme={mantineTheme}>
						{children}
					</MantineProvider>
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
