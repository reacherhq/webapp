import { GeistProvider, myTheme } from "@/components/Geist";

import "./global.css";
import "./geist.gen.css";
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
				<link rel="icon" href="/favicon.png" sizes="any" />
			</head>
			<body>
				<GeistProvider themes={[myTheme]} themeType="default">
					{children}
				</GeistProvider>
				<Crisp />
			</body>
		</html>
	);
}
