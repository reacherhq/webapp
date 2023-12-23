import { Loading, Page } from "@geist-ui/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";

export default function Index(): React.ReactElement {
	const router = useRouter();
	const { user, userFinishedLoading } = useUser();

	useEffect(() => {
		if (userFinishedLoading && !user) {
			router.replace("/login").catch(sentryException);
		}
	}, [router, userFinishedLoading, user]);

	return (
		<Page>
			<Loading />
		</Page>
	);
}
