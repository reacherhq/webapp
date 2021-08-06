import { Button } from '@geist-ui/react';
import React from 'react';

import { productName } from '../../util/subs';
import { Card } from './Card';

export interface FreeTrialProps {
	active: boolean;
	currency: string;
}

export function FreeTrial({
	active,
	currency,
}: FreeTrialProps): React.ReactElement {
	const priceString = new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency,
		minimumFractionDigits: 0,
	}).format(0);

	return (
		<Card
			cta={
				<Button
					className="full-width"
					disabled={active}
					type="secondary"
				>
					{active ? 'Current Plan' : 'Downgrade'}
				</Button>
			}
			features={[
				'50 email verifications per month.',
				<span key="freeTrial-2">
					<a
						href="https://help.reacher.email/email-attributes-inside-json"
						target="_blank"
						rel="noopener noreferrer"
					>
						Full-featured
					</a>{' '}
					email verifications.
				</span>,
				<span key="freeTrial-3">
					Support via{' '}
					<a
						href="https://github.com/reacherhq/check-if-email-exists"
						target="_blank"
						rel="noopener noreferrer"
					>
						Github Issues
					</a>
					.
				</span>,
				'No credit card required.',
			]}
			header="Free Forever"
			subtitle="Use Reacher's servers with high IP reputation."
			title={productName()}
			price={priceString}
		/>
	);
}
