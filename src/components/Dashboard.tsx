import { Link as GLink, Loading, Page, Spacer, Text } from "@geist-ui/react";
import React from "react";

import { StripeMananageButton } from "../components/StripeManageButton";
import { SubGetStarted } from "../components/SubGetStarted/";
import { COMMERCIAL_LICENSE_PRODUCT_ID, productName } from "@/util/subs";
import { useUser } from "@/util/useUser";
import { ApiUsage } from "./ApiUsage";
import styles from "./Dashboard.module.css";
import { formatDate } from "@/util/helpers";

export function Dashboard(): React.ReactElement {
	const { userDetails, subscription, userFinishedLoading } = useUser();

	if (!userFinishedLoading) {
		return (
			<Page>
				<Loading />
			</Page>
		);
	}

	return (
		<Page>
			<section className={styles.plan}>
				<div>
					<Text h2>Hello{userDetails?.full_name || ""},</Text>
					<Text p>
						Thanks for using the Reacher{" "}
						{productName(subscription?.prices?.products)}!
					</Text>
					{subscription && (
						<>
							<StripeMananageButton>
								Manage Subscription
							</StripeMananageButton>
						</>
					)}
					<StripeMananageButton>Billing History</StripeMananageButton>
				</div>
				<div>
					<Text className="text-right" p>
						Active Subscription
					</Text>
					<Text className="text-right" h3>
						{productName(subscription?.prices?.products)}
					</Text>
					{subscription?.status === "active" &&
						subscription?.cancel_at && (
							<Text p small em className="text-right mt-0">
								⚠️ Plan ends on{" "}
								{formatDate(new Date(subscription.cancel_at))}
							</Text>
						)}
					{subscription?.prices?.products?.id !==
						COMMERCIAL_LICENSE_PRODUCT_ID && (
						<div className="text-right">
							<GLink
								color
								href="/pricing"
								data-sa-link-event="dashboard:upgrade:click"
							>
								<strong>Upgrade Plan</strong>
							</GLink>
						</div>
					)}
				</div>
			</section>

			<Spacer y={3} />

			{subscription?.prices?.product_id !==
				COMMERCIAL_LICENSE_PRODUCT_ID && <ApiUsage />}

			<SubGetStarted subscription={subscription} />
		</Page>
	);
}
