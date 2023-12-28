import { Loading, Page } from "@geist-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { GetStartedSaaS, Dashboard } from "@/components/Dashboard";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";

export default function VerifySingle(): React.ReactElement {
	const router = useRouter();
	const { user, userFinishedLoading, subscription } = useUser();

	useEffect(() => {
		if (userFinishedLoading && !user) {
			router.replace("/login").catch(sentryException);
		}
	}, [router, userFinishedLoading, user]);

	if (!user) {
		return (
			<Page>
				<Loading />
			</Page>
		);
	}

	return (
		<Dashboard subscription={subscription} tab="verify">
			<GetStartedSaaS />
		</Dashboard>
	);
}
