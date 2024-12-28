import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav/Nav";
import { dictionary } from "@/dictionaries";
import { Button, Container, Text } from "@mantine/core";
import Markdown from "marked-react";
import { DLink } from "@/components/DLink";
import Image from "next/image";
import { getAllPosts, getPostBySlug } from "@/util/blog";
import { Metadata } from "next";
import { notFound } from "next/navigation";

// Cover ideas:
// - https://unsplash.com/s/photos/geometric-pattern
// - https://stephaniewalter.design/blog/how-to-make-your-blog-images-stand-out-reflect-your-identity/

type Params = {
	params: Promise<{
		slug: string;
	}>;
};

export async function generateMetadata(props: Params): Promise<Metadata> {
	const params = await props.params;
	const blogPost = getPostBySlug(params.slug);
	if (!blogPost) {
		return notFound();
	}

	return {
		title: blogPost.title,
		description: blogPost.description,
		openGraph: {
			title: blogPost.title,
			images: [blogPost.ogImage.url],
		},
	};
}

export default async function Smtp({
	params: { lang, slug },
}: {
	params: { lang: string; slug: string };
}) {
	const d = await dictionary(lang);
	const blogPost = getPostBySlug(slug);
	if (!blogPost) {
		return notFound();
	}

	return (
		<>
			<Nav d={d} page="blog" />

			<Container mt="xl" size="45rem">
				<div className="text-center">
					<h1>{blogPost.title}</h1>
					<Text mb="xl">
						{d.blog.author}: {blogPost.author.name}.{" "}
						{d.blog.last_updated}: {blogPost.lastUpdated}.
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
						src={blogPost.ogImage.url}
						alt={blogPost.title}
						fill
						objectFit="cover"
					/>
				</div>

				<Markdown>{blogPost.content}</Markdown>
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

export async function generateStaticParams() {
	const posts = getAllPosts();

	return posts.map((post) => ({
		slug: post.slug,
	}));
}
