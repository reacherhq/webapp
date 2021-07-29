import React from 'react';

import { SupabaseProduct, SupabaseSubscription } from '../util/supabaseClient';
import { useUser } from '../util/useUser';

interface SubGetStartedProps {
	subscription: SupabaseSubscription | null; // null means Free Trial
}

const SAAS_10K_PRODUCT_ID = 'prod_JwU31ryqYd7r8Y';
const COMMERCIAL_LICENSE_PRODUCT_ID = 'prod_HvO8qL4nV1sjfJ';

export function subscriptionName(product?: SupabaseProduct): string {
	return product?.name || 'Free Trial';
}

export function SubGetStarted({
	subscription,
}: SubGetStartedProps): React.ReactElement {
	const { userDetails } = useUser();

	const subName = subscriptionName(subscription?.prices?.products);

	return (
		<>
			{(subscription?.prices?.product_id === SAAS_10K_PRODUCT_ID || // SaaS 10k Emails Plan
				!subscription) && ( // Free Trial
				<section className="section">
					<h2>Getting Started with the {subName}</h2>
					<p>
						Thanks for using Reacher {subName}! Below is how to get
						started with email verifications.
					</p>
					{userDetails?.token ? (
						<>
							<p>
								Use your private auth token below, and send a
								HTTP request to:
							</p>
							<p>
								<code>
									https://api.reacher.email/v0/check_email
								</code>
							</p>
							<p>with the following header:</p>
							<p>
								<code>Authorization: &lt;AUTH_TOKEN&gt;</code>
							</p>
							<p>
								Below is your unique <code>AUTH_TOKEN</code>.
								Don&apos;t share it with anyone else!
							</p>
							<p>
								<code>AUTH_TOKEN</code>:{' '}
								<mark>{userDetails.token}</mark>
							</p>
							<p>
								For example, a <code>curl</code> request looks
								like:
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
						</>
					) : (
						<p>ERROR: userDetails token is empty</p>
					)}
				</section>
			)}
			{subscription?.prices?.product_id ===
				COMMERCIAL_LICENSE_PRODUCT_ID && ( // Commercial License Plan
				<section className="section">
					<h2>Getting Started with the {subName}</h2>
					<p>
						Thanks for using Reacher {subName}! You should have
						received on your email a PDF containing the commercial
						license for the current period. This means that you can
						safely use Reacher&apos;s code in your own project.
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
			)}
		</>
	);
}
