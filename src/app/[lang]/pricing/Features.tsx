import { Spacer, Text } from "@geist-ui/react";
import React from "react";

import styles from "./Features.module.css";
import { Check } from "@geist-ui/react-icons";
import Markdown from "marked-react";
import { SpanRenderer } from "@/components/Markdown";

export function Features({
	features,
	title,
}: {
	features: string[];
	title: string;
}) {
	return (
		<>
			<Text b small>
				{title}
			</Text>
			<Spacer />
			{features?.map((f, i) => (
				<div key={i}>
					<div className="flex align-center">
						<div className={styles.icon}>
							<Check width={24} />
						</div>
						<Text small>
							<Markdown renderer={SpanRenderer}>{f}</Markdown>
						</Text>
					</div>
					<Spacer h={0.5} />
				</div>
			))}
			<Spacer />
		</>
	);
}
