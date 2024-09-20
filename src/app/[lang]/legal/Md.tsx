"use client";

import Markdown from "marked-react";
import React from "react";

export function Md({ children }: { children: string }) {
	return <Markdown>{children}</Markdown>;
}
