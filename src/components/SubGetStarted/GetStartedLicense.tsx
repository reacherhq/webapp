import { Card, Text } from '@geist-ui/react';
import React from 'react';

export function GetStartedLicense(): React.ReactElement {
	return (
		<Card>
			<Text h4>How to get started with email verifications?</Text>

			<Text p>
				To get started with self-hosting, please refer to our{' '}
				<a
					href="https://help.reacher.email/self-host-guide"
					target="_blank"
					rel="noopener noreferrer"
				>
					Self-Host Guide
				</a>
				.
			</Text>

			<Text p>
				If you have any questions about self-hosting, please contact ✉️{' '}
				<a href="mailto:amaury@reacher.email">amaury@reacher.email</a>.
			</Text>
		</Card>
	);
}
