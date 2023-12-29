import { GeistProvider, myTheme } from "@/components/Geist";

import "./global.css";
import "./geist.gen.css";
import { Nav } from "@/components/Nav/Nav";

export const metadata = {
	title: "Next.js",
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
					<Nav />
					{children}
				</GeistProvider>
			</body>
		</html>
	);
}
