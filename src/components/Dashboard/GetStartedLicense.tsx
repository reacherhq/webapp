import { dictionary } from "@/dictionaries";
import { Card, Text } from "@geist-ui/react";
import Markdown from "marked-react";
import { useRouter } from "next/router";
import React from "react";

export function GetStartedLicense(): React.ReactElement {
	const router = useRouter();
	const d = dictionary(router.locale).dashboard.get_started_license;

	return (
		<Card>
			<Text h4>{d.title}</Text>

			<Markdown>{d.explanation}</Markdown>
		</Card>
	);
}
