import { Link as GLink, Loading, Page, Spacer, Text } from "@geist-ui/react";
import React from "react";

import { StripeMananageButton } from "../components/StripeManageButton";
import {
	GetStartedNoPlan,
	GetStartedLicense,
	GetStartedSaas,
} from "../components/GetStarted";
import {
	COMMERCIAL_LICENSE_PRODUCT_ID,
	SAAS_100K_PRODUCT_ID,
	SAAS_10K_PRODUCT_ID,
	productName,
} from "@/util/subs";
import { useUser } from "@/util/useUser";
import { ApiUsage } from "./ApiUsage";
import styles from "./Dashboard.module.css";
import { formatDate } from "@/util/helpers";
import { SubscriptionWithPrice } from "@/supabase/domain.types";

export function Dashboard(): React.ReactElement {
	const { userDetails, subscription, subscriptionLoaded } = useUser();

	if (!subscriptionLoaded) {
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
						<span>
							{subscription
								? `Thanks for using the Reacher ${productName(
										subscription?.prices?.products
								  )}.`
								: "Thank for signing up for Reacher."}
						</span>
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

			{showContent(subscription)}
		</Page>
	);
}

function showContent(
	subscription: SubscriptionWithPrice | null
): React.ReactElement {
	switch (subscription?.prices?.product_id) {
		case COMMERCIAL_LICENSE_PRODUCT_ID:
			return <GetStartedLicense />;
		case SAAS_10K_PRODUCT_ID:
		case SAAS_100K_PRODUCT_ID:
			return (
				<>
					<ApiUsage />
					<GetStartedSaas />
				</>
			);
		default:
			return <GetStartedNoPlan />;
	}
}
