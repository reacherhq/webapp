import { GeistProvider, myTheme } from "@/components/Geist";

import "./global.css";
import "./geist.gen.css";
import { Footer } from "@/components/Footer";

export const metadata = {
	title: "Reacher Email Verification",
	description: "Generated by Next.js",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<GeistProvider themes={[myTheme]} themeType="default">
					{children}
					<Footer />
				</GeistProvider>
			</body>
		</html>
	);
}
