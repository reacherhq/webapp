import { Loading, Page, Spacer } from "@geist-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { GetStartedLicense, SubscriptionHeader } from "@/components/Dashboard";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";

export default function License(): React.ReactElement {
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
			<GetStartedLicense />
		</Page>
	);
}
