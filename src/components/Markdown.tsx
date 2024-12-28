import type { ReactNode } from "react";
import { DLink } from "./DLink";
import { Dictionary } from "@/dictionaries";

export const SpanRenderer = {
	paragraph(children: ReactNode) {
		return <span>{children}</span>;
	},
};

export function LinkRenderer(d: Dictionary) {
	return {
		link(href: string, text: ReactNode) {
			return (
				<DLink d={d} href={href}>
					{text}
				</DLink>
			);
		},
	};
}

export function removeFrontMatter(markdown: string): string {
	const frontMatterRegex = /^---[\s\S]*?---\n/;
	return markdown.replace(frontMatterRegex, "");
}
