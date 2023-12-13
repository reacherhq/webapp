import React from "react";
import { Text } from "@geist-ui/react";
import { ProductCard } from "./ProductCard";
import type { ProductCardProps } from "./ProductCard";

export function SaaS10k(props: ProductCardProps): React.ReactElement {
	return (
		<ProductCard
			{...props}
			header={
				<Text b small>
					For individuals
				</Text>
			}
			features={features}
			subtitle={<span>10,000 email verifications / mo</span>}
		/>
	);
}

const features = [
	"Use Reacher's servers with high IP reputation.",
	<span key="saasFeatures-2">
		<a
			href="https://help.reacher.email/email-attributes-inside-json"
			target="_blank"
			rel="noopener noreferrer"
		>
			Full-featured
		</a>{" "}
		email verifications.
	</span>,
	<span key="customer-support">
		<strong>Customer support</strong> via email/chat.
	</span>,
	"Cancel anytime.",
];
