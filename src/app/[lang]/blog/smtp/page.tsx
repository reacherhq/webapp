import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav/Nav";
import { dictionary } from "@/dictionaries";
import { Page } from "@geist-ui/react";
import fs from "fs";
import Markdown from "marked-react";

console.log(process.cwd());
const blog = fs.readFileSync("./src/app/[lang]/blog/smtp/smtp.md").toString();

export default async function Smtp({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const d = await dictionary(lang);

	return (
		<>
			<Nav d={d} page="blog" />
			<Page>
				<Markdown>{blog}</Markdown>
			</Page>

			<Footer d={d} />
		</>
	);
}
