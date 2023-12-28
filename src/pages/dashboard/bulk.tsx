import { Loading, Page } from "@geist-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Dashboard, GetStartedBulk } from "@/components/Dashboard";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";
import { ENABLE_BULK } from "@/util/helpers";

export default function Bulk(): React.ReactElement {
	const router = useRouter();
	const { user, userFinishedLoading, subscription } = useUser();

	useEffect(() => {
		if (userFinishedLoading && !user) {
			router.replace("/login").catch(sentryException);
		}
	}, [router, userFinishedLoading, user]);

	if (ENABLE_BULK === 0) {
		return <p>Bulk is disabled</p>;
	}

	if (!user || !subscription) {
		return (
			<Page>
				<Loading />
			</Page>
		);
	}

	return (
		<Dashboard subscription={subscription} tab="bulk">
			<GetStartedBulk />
		</Dashboard>
	);
}
