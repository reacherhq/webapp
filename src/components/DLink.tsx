import { Dictionary } from "@/dictionaries";
import Link, { LinkProps } from "next/link";

export interface DLinkProps
	extends LinkProps,
		React.RefAttributes<HTMLAnchorElement> {
	className?: string;
	children?: React.ReactNode;
	d: Dictionary;
}

export function DLink({ d, href, children, ...rest }: DLinkProps) {
	return (
		<Link
			href={href.toString().startsWith("/") ? `/${d.lang}${href}` : href}
			{...rest}
		>
			{children}
		</Link>
	);
}
