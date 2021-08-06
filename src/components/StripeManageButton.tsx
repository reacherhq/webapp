import { Link as GLink } from '@geist-ui/react';
import React, { useState } from 'react';

import { postData } from '../util/helpers';
import { sentryException } from '../util/sentry';
import { useUser } from '../util/useUser';

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
			const { url } = await postData<{ url: string }>({
				url: '/api/stripe/create-portal-link',
				token: session?.access_token,
			});

			window.open(url);
		} catch (err) {
			sentryException(err);
			alert((err as Error).message);
		}

		setLoading(false);
	};

	return (
		<GLink href="#" color icon onClick={redirectToCustomerPortal}>
			<strong>{loading ? 'Redirecting to Stripe...' : children}</strong>
		</GLink>
	);
}
