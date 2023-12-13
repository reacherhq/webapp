import React from "react";
import { Check, Info } from "@geist-ui/react-icons";
import { ProductCard, ProductCardProps } from "./ProductCard";
import { Spacer, Text } from "@geist-ui/react";
import styles from "./Card.module.css";

export function Commercial(props: ProductCardProps): React.ReactElement {
	return (
		<ProductCard
			{...props}
			extra={
				<div>
					<Text b small>
						What you need to do:
					</Text>
					<Spacer />
					<div className="flex align-center">
						<div>
							<Check className={styles.icon} width={24} />
						</div>
						<Text small>
							Purchase servers yourself to self-host Reacher.{" "}
							<a
								href="https://help.reacher.email/self-host-guide"
								target="_blank"
								rel="noopener noreferrer"
							>
								Read how
							</a>
							.
						</Text>
					</div>
					<Spacer />
				</div>
			}
			features={features}
			footer={
				<div className="flex">
					<div>
						<Info className={styles.icon} width={24} />
					</div>
					<Text small>
						Want a <strong>free trial</strong> before committing?
						Feel free to try self-hosting with the{" "}
						<a
							href="https://help.reacher.email/self-host-guide"
							target="_blank"
							rel="noopener noreferrer"
						>
							open-source guide
						</a>
						, and subscribe once you&apos;re ready.
					</Text>
				</div>
			}
			header={
				<Text b small type="success">
					🏠 Self-Hosted
				</Text>
			}
			subtitle={
				<span>
					<strong>Unlimited</strong> email verifications / mo
				</span>
			}
		/>
	);
}

const features = [
	<span key="licenseFeatures-3">
		<strong>Unlimited</strong>{" "}
		<a
			href="https://help.reacher.email/email-attributes-inside-json"
			target="_blank"
			rel="noopener noreferrer"
		>
			full-featured
		</a>{" "}
		email verifications.
	</span>,
	<span key="licenseFeatures-1">
		<strong>💪 Bulk</strong> email verifications.{" "}
		<a
			href="https://help.reacher.email/bulk-email-verification"
			target="_blank"
			rel="noopener noreferrer"
		>
			Read more.
		</a>
	</span>,
	<span key="licenseFeatures-2">No data sent back to Reacher.</span>,

	<span key="licenseFeatures-4">
		<strong>Customer support</strong> via email/chat.
	</span>,
	<span key="licenseFeatures-6">
		See{" "}
		<a
			href="https://help.reacher.email/reacher-licenses"
			target="_blank"
			rel="noopener noreferrer"
		>
			full terms and details
		</a>
		.
	</span>,
];
