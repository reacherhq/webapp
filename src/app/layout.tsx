export const metadata = {
	title: "Reacher - Open Source Email Verification Tool",
	description:
		"Reacher is a fast, accurate and simple email verification tool to reduce your bounce rate and maintain your sender reputation. We check SMTP responses, MX records, catch-all and disposable addresses.",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
