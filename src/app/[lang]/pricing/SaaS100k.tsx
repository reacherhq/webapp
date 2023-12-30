import React from "react";
import { Text } from "@geist-ui/react";
import { ProductCard } from "./ProductCard";
import type { ProductCardProps } from "./ProductCard";
import Markdown from "marked-react";
import { SpanRenderer } from "@/components/Markdown";
import { ENABLE_BULK } from "@/util/helpers";

export function SaaS100k(
	props: Omit<ProductCardProps, "title">
): React.ReactElement {
	const d = props.d.pricing.saas100k;

	return (
		<ProductCard
			{...props}
			header={
				<Text b small type="warning">
					{d.overtitle}
				</Text>
			}
			features={[
				ENABLE_BULK ? (
					<Markdown renderer={SpanRenderer} key="licenseFeatures-1">
						{d.bulk}
					</Markdown>
				) : (
					""
				),
				d.reacher_ip,
				<Markdown renderer={SpanRenderer} key="saasFeatures-2">
					{d.full_feature}
				</Markdown>,
				<Markdown renderer={SpanRenderer} key="customer-support">
					{d.support}
				</Markdown>,
				d.cancel,
			].filter((x) => !!x)}
			subtitle={<span>{d.subtitle}</span>}
		/>
	);
}
