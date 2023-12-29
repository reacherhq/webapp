"use client";

import { Dictionary } from "@/dictionaries";
import { Card, Text } from "@/components/Geist";
import Markdown from "marked-react";
import React from "react";

export function GetStartedCommercial(props: { d: Dictionary }) {
	const d = props.d.dashboard.get_started_license;

	return (
		<Card>
			<Text h3>{d.title}</Text>

			<Markdown>{d.explanation}</Markdown>
		</Card>
	);
}
