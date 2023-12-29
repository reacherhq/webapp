"use client";

import { Card, Text } from "@geist-ui/react";
import Markdown from "marked-react";
import React from "react";
import { LinkRenderer } from "@/components/Markdown";
import { Dictionary } from "@/dictionaries";

export function GetStartedNoPlan(props: { d: Dictionary }) {
	const d = props.d.dashboard.get_started_no_plan;

	return (
		<Card>
			<Text h4>{d.title}</Text>
			<Markdown renderer={LinkRenderer(props.d)}>
				{d.head_to_pricing}
			</Markdown>
		</Card>
	);
}
