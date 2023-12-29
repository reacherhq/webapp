import { dictionary } from "@/dictionaries";
import { Card, Text } from "@geist-ui/react";
import Markdown from "marked-react";
import React from "react";

export async function GetStartedLicense({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const d = (await dictionary(lang)).dashboard.get_started_license;

	return (
		<Card>
			<Text h3>{d.title}</Text>

			<Markdown>{d.explanation}</Markdown>
		</Card>
	);
}
