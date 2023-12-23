import { Loading, Page, Spacer, Tabs, Text } from "@geist-ui/react";
import React from "react";
import Link from "next/link";
import { StripeMananageButton } from "./StripeManageButton";
import { GetStartedLicense } from "./GetStartedLicense";
import { GetStartedNoPlan } from "./GetStartedNoPlan";
import { GetStartedSaas } from "./GetStartedApi";
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
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";
import { getApiUsageClient } from "@/util/supabaseClient";
import Mail from "@geist-ui/react-icons/mail";
import Database from "@geist-ui/react-icons/database";
import GitPullRequest from "@geist-ui/react-icons/gitPullRequest";

export function Dashboard(): React.ReactElement {
	const { subscription, subscriptionLoaded } = useUser();
	const router = useRouter();
	const d = dictionary(router.locale);

	if (!subscriptionLoaded) {
		return (
			<Page>
				<Loading />
			</Page>
		);
	}

	return (
		<Page>
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
					<Spacer y={2} />
					<Tabs initialValue="verify">
						<Tabs.Item
							label={
								<>
									<Mail />
									Verify a single email
								</>
							}
							value="verify"
						/>
						<Tabs.Item
							disabled
							label={
								<>
									<Database />
									Bulk verification
								</>
							}
							value="bulk"
						/>
						<Tabs.Item
							label={
								<>
									<GitPullRequest />
									API
								</>
							}
							value="api"
						/>
					</Tabs>
					<Demo />
					<GetStartedSaas />
				</>
			);
		default:
			return <GetStartedNoPlan />;
	}
}
