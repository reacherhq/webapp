import React, { useEffect, useState } from 'react';

import { sentryException } from '../../util/sentry';
import { productName, subApiMaxCalls } from '../../util/subs';
import {
	getApiUsageClient,
	SupabaseSubscription,
} from '../../util/supabaseClient';
import { useUser } from '../../util/useUser';

interface GetStartedSaasProps {
	subscription: SupabaseSubscription | null; // null means Free Trial
}

export function GetStartedSaas({
	subscription,
}: GetStartedSaasProps): React.ReactElement {
	const { user, userDetails } = useUser();
	const [apiCalls, setApiCalls] = useState(0);

	const subName = productName(subscription?.prices?.products);

	useEffect(() => {
		if (!user) {
			return;
		}

		getApiUsageClient(user).then(setApiCalls).catch(sentryException);
	}, [user]);

	return (
		<section className="section">
			<h2>Getting Started with the {subName}</h2>
			<p>
				Thanks for using Reacher {subName}! Below is how to get started
				with email verifications.
			</p>
			{userDetails?.token ? (
				<>
					<p>
						Use your private auth token below, and send a HTTP
						request to:
					</p>
					<p>
						<code>https://api.reacher.email/v0/check_email</code>
					</p>
					<p>with the following header:</p>
					<p>
						<code>Authorization: &lt;AUTH_TOKEN&gt;</code>
					</p>
					<p>
						Below is your unique <code>AUTH_TOKEN</code>. Don&apos;t
						share it with anyone else!
					</p>
					<p>
						<code>AUTH_TOKEN</code>:{' '}
						<mark>{userDetails.token}</mark>
					</p>
					<p>
						For example, a <code>curl</code> request looks like:
						<br />
						<code>{`curl -X POST \
	https://api.reacher.email/v0/check_email \
	-H 'content-type: application/json' \
	-H 'authorization: ${userDetails.token}' \
	-d '{
		"to_email": "test@gmail.com"
	}'`}</code>
					</p>
					<p>
						For more details, check out our{' '}
						<a
							href="https://help.reacher.email"
							target="_blank"
							rel="noopener noreferrer"
						>
							documentation
						</a>
						.
					</p>
					<h4>
						API usage this month: {apiCalls}/
						{subApiMaxCalls(subscription)}.
					</h4>
				</>
			) : (
				<p>Error: userDetails token is empty</p>
			)}
		</section>
	);
}
