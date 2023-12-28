import { Loading, Page } from "@geist-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { GetStartedApi, Dashboard } from "@/components/Dashboard";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";

export default function Api(): React.ReactElement {
	const router = useRouter();
	const { user, userLoaded, subscription } = useUser();

	useEffect(() => {
		if (userLoaded && !user) {
			router.replace("/login").catch(sentryException);
		}
	}, [router, userLoaded, user]);

	if (!user || !subscription) {
		return (
			<Page>
				<Loading />
			</Page>
		);
	}

	return (
		<Dashboard subscription={subscription} tab="api">
			<GetStartedApi />
		</Dashboard>
	);
}
