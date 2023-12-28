import React from "react";
import { Text } from "@geist-ui/react";
import { ProductCard } from "./ProductCard";
import type { ProductCardProps } from "./ProductCard";
import Markdown from "marked-react";
import { SpanRenderer } from "@/components/Markdown";

export function SaaS10k(
	props: Omit<ProductCardProps, "title">
): React.ReactElement {
	const d = props.d.pricing.saas10k;

	return (
		<ProductCard
			{...props}
			header={
				<Text b small>
					{d.overtitle}
				</Text>
			}
			features={[
				d.reacher_ip,
				<Markdown renderer={SpanRenderer} key="saasFeatures-2">
					{d.full_feature}
				</Markdown>,
				<Markdown renderer={SpanRenderer} key="customer-support">
					{d.support}
				</Markdown>,
				d.cancel,
			]}
			subtitle={<span>{d.subtitle}</span>}
		/>
	);
}
