import { useRouter } from 'next/router';
import React, { useEffect } from 'react';

import { sentryException } from '../util/sentry';
import { useUser } from '../util/useUser';

export default function Index(): React.ReactElement {
	const { user, userLoaded } = useUser();
	const router = useRouter();

	useEffect(() => {
		userLoaded &&
			(user
				? router.replace('/dashboard')
				: router.replace('/signin')
			).catch(sentryException);
	}, [router, user, userLoaded]);

	return <p>Loading...</p>;
}
