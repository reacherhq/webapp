import React from 'react';

import { productName } from '../../util/subs';
import { Card } from '../Card';

export interface FreeTrialProps {
	active: boolean;
}

export function FreeTrial({ active }: FreeTrialProps): React.ReactElement {
	return (
		<Card
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
