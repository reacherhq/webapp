import { Info } from "@geist-ui/react-icons";
import { ProductCard, ProductCardProps } from "./ProductCard";
import { Text } from "@geist-ui/react";
import styles from "./Card.module.css";

export function Commercial(props: ProductCardProps): React.ReactElement {
	return (
		<ProductCard
			{...props}
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
					For self-hosting
				</Text>
			}
			subtitle={
				<span>
					Self-host Reacher <br />
					with your own infrastructure.
				</span>
			}
		/>
	);
}

const features = [
	<span key="licenseFeatures-0">
		<strong>Unlimited</strong> email verifications per month.
	</span>,
	<span key="licenseFeatures-1">
		<strong>💪 Bulk</strong> email verification.{" "}
		<a
			href="https://help.reacher.email/bulk-email-verification"
			target="_blank"
			rel="noopener noreferrer"
		>
			Read more.
		</a>
	</span>,
	<span key="licenseFeatures-2">
		Self-host in <strong>your commercial apps</strong>. No data sent back to
		Reacher.
	</span>,
	<span key="licenseFeatures-3">
		<a
			href="https://help.reacher.email/email-attributes-inside-json"
			target="_blank"
			rel="noopener noreferrer"
		>
			Full-featured
		</a>{" "}
		email verifications.
	</span>,
	"Customer support via email/chat.",
	<span key="licenseFeatures-4">
		Comes with{" "}
		<a
			href="https://help.reacher.email/self-host-guide"
			target="_blank"
			rel="noopener noreferrer"
		>
			self-host guides
		</a>{" "}
		(Docker, OVH).
	</span>,
	<span key="licenseFeatures-5">
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
