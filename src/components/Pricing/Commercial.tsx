import React from "react";
import { Check, Info } from "@geist-ui/react-icons";
import { ProductCard, ProductCardProps } from "./ProductCard";
import { Spacer, Text } from "@geist-ui/react";
import styles from "./Card.module.css";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";
import Markdown from "marked-react";
import { SpanRenderer } from "../Markdown";

export function Commercial(
	props: Omit<ProductCardProps, "title">
): React.ReactElement {
	const router = useRouter();
	const d = dictionary(router.locale).pricing.commercial;

	return (
		<ProductCard
			{...props}
			extra={
				<div>
					<Text b small>
						{d.what_need_to_do}
					</Text>
					<Spacer />
					<div className="flex align-center">
						<div>
							<Check className={styles.icon} width={24} />
						</div>
						<Text small>
							<Markdown renderer={SpanRenderer}>
								{d.purchase_server}
							</Markdown>
						</Text>
					</div>
					<Spacer />
				</div>
			}
			features={[
				<Markdown renderer={SpanRenderer} key="licenseFeatures-3">
					{d.unlimited_emails}
				</Markdown>,
				<Markdown renderer={SpanRenderer} key="licenseFeatures-1">
					{d.bulk}
				</Markdown>,
				d.no_data_reacher,
				<Markdown renderer={SpanRenderer} key="licenseFeatures-4">
					{d.support}
				</Markdown>,
				<Markdown renderer={SpanRenderer} key="licenseFeatures-6">
					{d.terms}
				</Markdown>,
			]}
			footer={
				<div className="flex">
					<div>
						<Info className={styles.icon} width={24} />
					</div>
					<Text small>
						<Markdown renderer={SpanRenderer}>
							{d.free_trial}
						</Markdown>
					</Text>
				</div>
			}
			header={
				<Text b small type="success">
					{d.overtitle}
				</Text>
			}
			subtitle={<Markdown renderer={SpanRenderer}>{d.subtitle}</Markdown>}
			title={d.title}
		/>
	);
}
