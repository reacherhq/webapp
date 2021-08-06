import { Card as GCard, Divider, Spacer, Text } from '@geist-ui/react';
import { Check } from '@geist-ui/react-icons';
import React from 'react';

import styles from './Card.module.css';

export interface CardProps extends React.HTMLProps<HTMLDivElement> {
	body?: string | React.ReactChild;
	cta?: string | React.ReactChild;
	features?: (string | React.ReactChild)[];
	header: string | React.ReactChild;
	price?: string | React.ReactChild;
	subtitle?: string | React.ReactChild;
	footer?: string | React.ReactChild;
	title: string;
}

export function Card({
	cta,
	header,
	features,
	price,
	title,
	subtitle,
	body,
	footer,
}: CardProps): React.ReactElement {
	return (
		<GCard>
			<Text className="text-center">{header}</Text>
			<Text className="text-center" h3>
				{title}
			</Text>
			<Text className="text-center flex justify-center" small>
				{subtitle}
			</Text>
			<Spacer y={2} />
			<Text className="text-center" h3>
				{price}
				<Text className={styles.mo} span type="secondary">
					/mo
				</Text>
			</Text>
			<Spacer y={2} />
			<div className="flex justify-center">{cta}</div>

			<Spacer />
			<Divider />
			<Spacer />

			<div>
				<Text b small>
					What you get:
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
						<Spacer y={0.5} />
					</div>
				))}
			</div>

			{body}

			{footer && <Divider />}
			{footer && <div>{footer}</div>}
		</GCard>
	);
}
