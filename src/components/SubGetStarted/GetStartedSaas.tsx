import { Card, Snippet, Spacer, Text } from '@geist-ui/react';
import React from 'react';

import { useUser } from '../../util/useUser';

export function GetStartedSaas(): React.ReactElement {
	const { userDetails } = useUser();

	return (
		<Card>
			<Text h4>How to get started with email verifications?</Text>
			<Spacer />

			{userDetails?.api_token ? (
				<>
					<Text p>
						Use your private auth token below, and send a HTTP
						request to:
					</Text>
					<Snippet
						symbol=""
						text="https://api.reacher.email/v0/check_email"
						type="lite"
						width="100%"
					/>
					<Text p>with the following header:</Text>
					<Snippet
						symbol=""
						text="Authorization: {AUTH_TOKEN}"
						type="lite"
						width="100%"
					/>
					<Text p>
						Below is your unique AUTH_TOKEN.{' '}
						<strong>Don&apos;t share it with anyone else!</strong>
					</Text>
					<Snippet
						symbol=""
						text={userDetails.api_token}
						type="lite"
						width="100%"
					/>
					<Text p>
						For example, a <code>curl</code> request looks like:
					</Text>
					<Snippet
						symbol=""
						text={[
							'curl -X POST \\',
							'  https://api.reacher.email/v0/check_email \\',
							'  -L \\',
							"  -H 'content-type: application/json' \\",
							`  -H 'authorization: ${userDetails.api_token}' \\`,
							`  -d '{"to_email": "test@gmail.com"}'`,
						]}
						type="lite"
						width="100%"
					/>
					<Text p>
						For more details, check out our{' '}
						<a
							href="https://help.reacher.email"
							target="_blank"
							rel="noopener noreferrer"
						>
							documentation
						</a>
						.
					</Text>
				</>
			) : (
				<Text p>
					Error: userDetails token is empty. Please contact
					amaury@reacher.email if you see this error.
				</Text>
			)}
		</Card>
	);
}
