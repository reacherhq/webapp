import { Link as GLink } from "@geist-ui/react";
import React, { useState } from "react";

import { postData } from "@/util/helpers";
import { sentryException } from "@/util/sentry";
import { Dictionary } from "@/dictionaries";

export interface StripeMananageButton {
	children: React.ReactNode | string;
	d: Dictionary;
}

export function StripeMananageButton({
	children,
	d,
}: StripeMananageButton): React.ReactElement {
	const [loading, setLoading] = useState(false);

	const redirectToCustomerPortal = async () => {
		setLoading(true);
		try {
			const { url } = await postData<{ url: string }>({
				url: "/api/stripe/create-portal-link",
				data: {
					locale: d.lang,
				},
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
