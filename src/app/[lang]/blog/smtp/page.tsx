import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav/Nav";
import { dictionary } from "@/dictionaries";
import { Button, Container, Text } from "@mantine/core";
import fs from "fs";
import Markdown from "marked-react";
import { DLink } from "@/components/DLink";
import Image from "next/image";

// Cover ideas:
// - https://unsplash.com/s/photos/geometric-pattern
// - https://stephaniewalter.design/blog/how-to-make-your-blog-images-stand-out-reflect-your-identity/
import cover from "./cover.jpg";

export const metadata = {
	title: "What's Reacher's Secret for Accuracy?",
	description:
		"Reacher employs SMTP email verification to validate email addresses through commands like EHLO and RCPT TO. Positive responses confirm validity, while negative ones indicate issues. This method improves deliverability, reduces bounce rates, and supports efficient scaling of email verification.",
	author: "Amaury",
	lastUpdated: "28.12.2024",
};

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

			<Container mt="xl" size="45rem">
				<div className="text-center">
					<h1>{metadata.title}</h1>
					<Text mb="xl">
						{d.blog.author}: {metadata.author}.{" "}
						{d.blog.last_updated}: {metadata.lastUpdated}.
					</Text>
				</div>

				<div
					style={{
						height: "400px",
						width: "45rem",
						overflow: "hidden",
						position: "relative",
					}}
				>
					<Image
						src={cover}
						alt={metadata.title}
						fill
						objectFit="cover"
					/>
				</div>

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
