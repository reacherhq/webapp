import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav/Nav";
import { dictionary } from "@/dictionaries";
import { Button, Container } from "@mantine/core";
import fs from "fs";
import Markdown from "marked-react";

import styles from "../blog.module.css";
import { DLink } from "@/components/DLink";

console.log(process.cwd());

export default async function Smtp({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const d = await dictionary(lang);
	const blog = fs
		.readFileSync("./src/app/[lang]/blog/smtp/smtp.md")
		.toString();

	return (
		<>
			<Nav d={d} page="blog" />
			<Container className={styles.blog} mt="xl" size="45rem">
				<Markdown>{blog}</Markdown>
			</Container>

			<div className="text-center">
				<DLink d={d} href="/dashboard/verify">
					<Button mt="xl" size="lg">
						{d.blog.cta}
					</Button>
				</DLink>
			</div>

			<Footer d={d} />
		</>
	);
}
