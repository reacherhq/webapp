import { Card as GCard, Divider, Spacer, Text } from "@geist-ui/react";
import React from "react";

import styles from "./Card.module.css";
import { Dictionary } from "@/dictionaries";

export interface CardProps extends React.HTMLProps<HTMLDivElement> {
	d: Dictionary;
	cta?: React.ReactElement;
	features?: React.ReactElement[];
	header?: string | React.ReactElement;
	price?: string | React.ReactElement;
	subtitle?: React.ReactElement;
	footer?: React.ReactElement;
	title: string;
}

export function Card(props: CardProps): React.ReactElement {
	const { cta, header, features, price, title, subtitle, footer } = props;
	const d = props.d.pricing;

	return (
		<GCard className={styles.container}>
			<Text className="text-center flex justify-center" small b>
				{header}
			</Text>
			<Spacer h={1} />
			<Text className="text-center" h3>
				{title}
			</Text>
			<Spacer h={1} />
			<Text className="text-center flex justify-center" small>
				{subtitle}
			</Text>
			<Spacer h={2} />
			<Text className="text-center" h3>
				{price}
				<Text className={styles.mo} span type="secondary">
					{d.cards.price}
				</Text>
			</Text>
			<Spacer h={2} />
			<div className="flex justify-center">{cta}</div>

			<Spacer />
			<Divider />
			<Spacer />

			{features}

			{footer && <div>{footer}</div>}
		</GCard>
	);
}
