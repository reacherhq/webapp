import { Link as GLink } from "@geist-ui/react";
import React, { useState } from "react";

import { postData } from "../util/helpers";
import { sentryException } from "../util/sentry";
import { useUser } from "../util/useUser";

export interface StripeMananageButton {
	children: React.ReactChildren | string;
}

export function StripeMananageButton({
	children,
}: StripeMananageButton): React.ReactElement {
	const [loading, setLoading] = useState(false);
	const { session } = useUser();

	const redirectToCustomerPortal = async () => {
		setLoading(true);
		try {
			if (!session?.access_token) {
				throw new Error("session access_token is empty");
			}

			const { url } = await postData<{ url: string }>({
				url: "/api/stripe/create-portal-link",
				token: session.access_token,
			});

			window.location.assign(url);
		} catch (err) {
			sentryException(err as Error);
			alert((err as Error).message);
		}

		setLoading(false);
	};

	return (
		<GLink
			href="#"
			color
			icon
			onClick={() => {
				redirectToCustomerPortal().catch(sentryException);
			}}
			data-sa-link-event="dashboard:stripe-billing:click"
		>
			<strong>{loading ? "Redirecting to Stripe..." : children}</strong>
		</GLink>
	);
}
