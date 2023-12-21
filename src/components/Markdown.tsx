import type { ReactNode } from "react";

export const SpanRenderer = {
	paragraph(children: ReactNode) {
		return <span>{children}</span>;
	},
};
