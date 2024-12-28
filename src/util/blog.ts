import { join } from "path";
import fs from "fs";
import matter from "gray-matter";

type Author = {
	name: string;
	picture: string;
};

type Post = {
	slug: string;
	title: string;
	lastUpdated: string;
	description: string; // For SEO
	author: Author;
	content: string;
	ogImage: {
		url: string;
	};
};
const postsDirectory = join(process.cwd(), "_posts");

export function getPostSlugs() {
	return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string) {
	const realSlug = slug.replace(/\.md$/, "");
	const fullPath = join(postsDirectory, `${realSlug}.md`);
	const fileContents = fs.readFileSync(fullPath, "utf8");
	const { data, content } = matter(fileContents);

	return { ...data, slug: realSlug, content } as Post;
}

export function getAllPosts(): Post[] {
	const slugs = getPostSlugs();
	const posts = slugs
		.map((slug) => getPostBySlug(slug))
		// sort posts by date in descending order
		.sort((post1, post2) =>
			post1.lastUpdated > post2.lastUpdated ? -1 : 1
		);
	return posts;
}
