import { Link as GLink } from "@geist-ui/react";
import React, { useState } from "react";

import { postData } from "@/util/helpers";
import { sentryException } from "@/util/sentry";
import { usePathname } from "next/navigation";
import { getLocale } from "@/dictionaries";

export interface StripeMananageButton {
	children: React.ReactNode | string;
}

export function StripeMananageButton({
	children,
}: StripeMananageButton): React.ReactElement {
	const [loading, setLoading] = useState(false);
	const pathname = usePathname();
	const lang = getLocale(pathname);

	const redirectToCustomerPortal = async () => {
		setLoading(true);
		try {
			const { url } = await postData<{ url: string }>({
				url: "/api/stripe/create-portal-link",
				data: {
					locale: lang,
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
