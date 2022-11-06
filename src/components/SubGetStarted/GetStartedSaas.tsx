import { Card, Note, Snippet, Spacer, Text } from '@geist-ui/react';
import React from 'react';

import { useUser } from '../../util/useUser';

export function GetStartedSaas(): React.ReactElement {
	const { userDetails } = useUser();

	return (
		<Card>
			<Text h4>How to get started with email verifications?</Text>
			<Spacer />
			<Note type="warning" label={false}>
				💡 If this is your first time with Reacher, check out our{' '}
				<a
					href="https://help.reacher.email/verify-your-1st-email"
					target="_blank"
					rel="noopener noreferrer"
				>
					beginner's guide
				</a>
				.
			</Note>

			{userDetails?.api_token ? (
				<>
					<Text p>
						Use your private auth token below, and send a HTTP POST
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
						The most important field to check is{' '}
						<code>is_reachable</code>.To understand the full API
						response, check out the{' '}
						<a
							href="https://help.reacher.email/email-attributes-inside-json"
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

			<Spacer />
			<Text h4>Help! I still don't understand what to do.</Text>
			<Text p>
				Use the chat widget on the bottom right corner to send me a
				message, or shoot me an email at{' '}
				<a href="mailto:amaury@reacher.email">amaury@reacher.email</a>.
			</Text>
		</Card>
	);
}
