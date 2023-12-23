import { Loading, Page, Spacer } from "@geist-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import {
	ApiUsage,
	SubscriptionHeader,
	GetStartedSaaS,
	Tabs,
} from "@/components/Dashboard";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";
import { SAAS_10K_PRODUCT_ID } from "@/util/subs";

export default function VerifySingle(): React.ReactElement {
	const router = useRouter();
	const { user, userFinishedLoading, subscription } = useUser();

	useEffect(() => {
		if (userFinishedLoading && !user) {
			router.replace("/login").catch(sentryException);
		}
	}, [router, userFinishedLoading, user]);

	if (!user || !subscription) {
		return (
			<Page>
				<Loading />
			</Page>
		);
	}

	return (
		<Page>
			<SubscriptionHeader subscription={subscription} />
			<Spacer y={2} />
			<ApiUsage subscription={subscription} />
			<Spacer y={2} />
			<Tabs
				bulkDisabled={
					subscription.prices.product_id === SAAS_10K_PRODUCT_ID
				}
				value="verify"
			/>
			<GetStartedSaaS />
		</Page>
	);
}
