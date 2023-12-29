import { Nav } from "@/components/Nav/Nav";
import { dictionary } from "@/dictionaries";
import React from "react";

export default function Layout({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const d = dictionary(lang);

	return (
		<>
			<Nav d={d} />
		</>
	);
}
