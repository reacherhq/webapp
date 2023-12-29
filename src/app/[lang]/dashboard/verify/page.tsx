import { Loading, Page } from "@geist-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { Dashboard } from "../Dashboard";
import { GetStartedSaaS } from "./GetStartedSaaS";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";

export default async function VerifySingle() {
	const router = useRouter();
	const { user, userLoaded, subscription } = useUser();

	useEffect(() => {
		if (userLoaded && !user) {
			router.replace("/login").catch(sentryException);
		}
	}, [router, userLoaded, user]);

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
