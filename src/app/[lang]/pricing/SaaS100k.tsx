import React from "react";
import { Text } from "@geist-ui/react";
import { ProductCard } from "./ProductCard";
import type { ProductCardProps } from "./ProductCard";
import { Features } from "./Features";

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
				<Features
					key="what-you-get"
					title={d.what_you_get}
					features={[
						d.bulk,
						d.reacher_ip,
						d.full_feature,
						d.support,
						d.cancel,
					]}
				/>,
			]}
			subtitle={<span>{d.subtitle}</span>}
		/>
	);
}
