import React from 'react';

import type { SupabaseSubscription } from '../../util/supabaseClient';
import { subscriptionName } from './';

interface GetStartedLicenseProps {
	subscription: SupabaseSubscription;
}

export function GetStartedLicense({
	subscription,
}: GetStartedLicenseProps): React.ReactElement {
	const subName = subscriptionName(subscription?.prices?.products);

	return (
		<section className="section">
			<h2>Getting Started with the {subName}</h2>
			<p>
				Thanks for using Reacher {subName}! You should have received on
				your email a PDF containing the commercial license for the
				current period. This means that you can safely use
				Reacher&apos;s code in your own project.
			</p>
			<p>
				To get started with self-hosting, please refer to our{' '}
				<a
					href="https://help.reacher.email/self-host-guide"
					target="_blank"
					rel="noopener noreferrer"
				>
					Self-Host Guide
				</a>
				.
			</p>
		</section>
	);
}
