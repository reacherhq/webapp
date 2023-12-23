import { Loading, Page } from "@geist-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";
import {
	COMMERCIAL_LICENSE_PRODUCT_ID,
	SAAS_100K_PRODUCT_ID,
	SAAS_10K_PRODUCT_ID,
} from "@/util/subs";

export default function Index(): React.ReactElement {
	const router = useRouter();
	const { user, userFinishedLoading, subscription, subscriptionLoaded } =
		useUser();

	useEffect(() => {
		if (userFinishedLoading && !user) {
			router.replace("/login").catch(sentryException);
		}
	}, [router, userFinishedLoading, user]);

	useEffect(() => {
		console.log("subscriptionLoaded", subscriptionLoaded);
		if (!subscriptionLoaded) {
			return;
		}

		switch (subscription?.prices.product_id) {
			case COMMERCIAL_LICENSE_PRODUCT_ID:
				router
					.replace("/dashboard/license", undefined, {
						locale: router.locale,
					})
					.catch(sentryException);
				break;
			case SAAS_10K_PRODUCT_ID:
			case SAAS_100K_PRODUCT_ID:
				router
					.replace("/dashboard/verify", undefined, {
						locale: router.locale,
					})
					.catch(sentryException);
				break;
			default:
				router
					.replace("/dashboard/noplan", undefined, {
						locale: router.locale,
					})
					.catch(sentryException);
		}
	}, [subscriptionLoaded, subscription, router]);

	return (
		<Page>
			<Loading />
		</Page>
	);
}
