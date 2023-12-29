"use client";

import { Card, Text } from "@geist-ui/react";
import Markdown from "marked-react";
import React from "react";
import { LinkRenderer } from "@/components/Markdown";
import { dictionary, getLocale } from "@/dictionaries";
import { usePathname } from "next/navigation";

export function GetStartedNoPlan() {
	const pathname = usePathname();
	const lang = getLocale(pathname);
	const d = dictionary(lang).dashboard.get_started_no_plan;

	return (
		<Card>
			<Text h4>{d.title}</Text>
			<Markdown renderer={LinkRenderer}>{d.head_to_pricing}</Markdown>
		</Card>
	);
}
