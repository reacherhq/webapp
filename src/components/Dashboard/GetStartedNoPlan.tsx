import { Card, Text } from "@geist-ui/react";
import Markdown from "marked-react";
import React from "react";
import { LinkRenderer } from "../Markdown";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";

export function GetStartedNoPlan(): React.ReactElement {
	const router = useRouter();
	const d = dictionary(router.locale).dashboard.get_started_no_plan;

	return (
		<Card>
			<Text h4>{d.title}</Text>
			<Markdown renderer={LinkRenderer}>{d.head_to_pricing}</Markdown>
		</Card>
	);
}
