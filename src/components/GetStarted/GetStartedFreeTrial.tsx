import { Card, Text } from "@geist-ui/react";
import Link from "next/link";
import React from "react";

export function GetStartedFreeTrial(): React.ReactElement {
	return (
		<Card>
			<Text h4>Select a Plan</Text>
			<p>
				Please head to the <Link href="/pricing">Pricing Page</Link> to
				select a plan in order to use Reacher.
			</p>
		</Card>
	);
}
