import React from "react";
import { Text } from "@geist-ui/react";
import { ProductCard } from "./ProductCard";
import type { ProductCardProps } from "./ProductCard";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";
import Markdown from "marked-react";
import { SpanRenderer } from "../Markdown";

export function SaaS100k(
	props: Omit<ProductCardProps, "title">
): React.ReactElement {
	const router = useRouter();
	const d = dictionary(router.locale).pricing.saas100k;

	return (
		<ProductCard
			{...props}
			header={
				<Text b small type="warning">
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
