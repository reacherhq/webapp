import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav/Nav";
import { dictionary } from "@/dictionaries";
import React from "react";

export const metadata = {
	title: "Dashboard",
};

export default async function Layout({
	children,
	params: { lang },
}: {
	children: React.ReactNode;
	params: { lang: string };
}) {
	const d = await dictionary(lang);

	return (
		<>
			<Nav d={d} />
			{children}
			<Footer d={d} />
		</>
	);
}
