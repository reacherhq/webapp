import { CustomReactRenderer } from "marked-react/dist/ReactRenderer";
import Link from "next/link";
import type { ReactNode } from "react";

export const SpanRenderer: CustomReactRenderer = {
	paragraph(children: ReactNode) {
		return <span>{children}</span>;
	},
};

export const LinkRenderer: CustomReactRenderer = {
	link(href: string, text: ReactNode) {
		return <Link href={href}>{text}</Link>;
	},
};
