import { Card as GCard, Divider, Spacer, Text } from "@geist-ui/react";
import Check from "@geist-ui/react-icons/check";
import React from "react";

import styles from "./Card.module.css";
import { Dictionary } from "@/dictionaries";

export interface CardProps extends React.HTMLProps<HTMLDivElement> {
	d: Dictionary;
	body?: React.ReactElement;
	cta?: React.ReactElement;
	extra?: React.ReactElement;
	features?: (string | React.ReactElement)[];
	header?: string | React.ReactElement;
	price?: string | React.ReactElement;
	subtitle?: React.ReactElement;
	footer?: React.ReactElement;
	title: string;
}

export function Card(props: CardProps): React.ReactElement {
	const {
		cta,
		header,
		features,
		extra,
		price,
		title,
		subtitle,
		body,
		footer,
	} = props;
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

			{extra}

			<div>
				<Text b small>
					{d.cards.what_you_get}
				</Text>
				<Spacer />
				{features?.map((f, i) => (
					<div key={i}>
						<div className="flex align-center">
							<div>
								<Check className={styles.icon} width={24} />
							</div>
							<Text small>{f}</Text>
						</div>
						<Spacer h={0.5} />
					</div>
				))}
			</div>

			{body}

			{footer && <Divider />}
			{footer && <div>{footer}</div>}
		</GCard>
	);
}
