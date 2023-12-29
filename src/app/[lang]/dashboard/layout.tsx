import { Nav } from "@/components/Nav/Nav";
import { dictionary } from "@/dictionaries";
import React from "react";

export default function Layout({
	children,
	params: { lang },
}: {
	children: React.ReactNode;
	params: { lang: string };
}) {
	const d = dictionary(lang);

	return (
		<>
			<Nav d={d} />
			{children}
		</>
	);
}
