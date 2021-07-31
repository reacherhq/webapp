import React from 'react';

import { productName } from '../../util/subs';
import { Card } from '../Card';

export interface FreeTrialProps {
	active: boolean;
}

export function FreeTrial({ active }: FreeTrialProps): React.ReactElement {
	return (
		<Card
			body={
				<>
					<p>
						50 email verifications per month.
						<br />
						<br />
					</p>
					<p>
						<a
							href="https://help.reacher.email/email-attributes-inside-json"
							target="_blank"
							rel="noopener noreferrer"
						>
							Full-featured
						</a>{' '}
						email verifications.
						<br />
						Support via{' '}
						<a
							href="https://github.com/reacherhq/check-if-email-exists"
							target="_blank"
							rel="noopener noreferrer"
						>
							Github Issues
						</a>
						.
					</p>
					<p>
						Use <strong>Reacher servers</strong> with high IP
						reputation.
						<br />
						No credit card required.
					</p>
				</>
			}
			title={productName()}
			subtitle={
				<>
					<p>Free Forever</p>
					<button className="btn btn-primary btn-lg" disabled>
						{active ? 'Active Subscription' : 'Unavailable'}
					</button>
				</>
			}
		/>
	);
}
