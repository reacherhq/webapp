import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav/Nav";
import { dictionary } from "@/dictionaries";
import React from "react";
import { promises as fs } from "fs";
import { Article } from "./Article";

export default async function AfterCleaningList({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const d = await dictionary(lang);
	const file = await fs.readFile(
		process.cwd() + `/src/app/[lang]/blog/after-cleaning-list/${lang}.md`,
		"utf8"
	);

	return (
		<>
			<Nav d={d} />
			<Article md={file} />
			<Footer d={d} />
		</>
	);
}
