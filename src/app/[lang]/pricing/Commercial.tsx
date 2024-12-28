import React from "react";
import { ProductCard, ProductCardProps } from "./ProductCard";
import { Text } from "@geist-ui/react";
import Markdown from "marked-react";
import { SpanRenderer } from "@/components/Markdown";
import { Features } from "./Features";

export function Commercial(
	props: Omit<ProductCardProps, "title">
): React.ReactElement {
	const d = props.d.pricing.commercial;

	return (
		<ProductCard
			{...props}
			features={[
				<Features
					key="what-needs-to-do"
					title={d.what_need_to_do}
					features={[d.purchase_server]}
				/>,
				<Features
					key="what-you-get"
					title={d.what_you_get}
					features={[
						d.unlimited_emails,
						d.bulk,
						d.no_data_reacher,
						d.support,
						d.terms,
					]}
				/>,
				<Features
					key="commercial-license-trial"
					title={d.free_trial}
					features={[d["10k_per_day"], d.proxy, d.data_shared]}
				/>,
			]}
			ctaInFooter
			header={
				<Text b small type="success">
					{d.overtitle}
				</Text>
			}
			subtitle={<Markdown renderer={SpanRenderer}>{d.subtitle}</Markdown>}
		/>
	);
}
