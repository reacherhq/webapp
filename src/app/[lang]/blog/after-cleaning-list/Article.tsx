"use client";

import React from "react";
import Markdown from "marked-react";

export function Article({ md }: { md: string }) {
	return (
		<article className="container">
			<Markdown value={md} />
		</article>
	);
}
