import { Capacity, Text } from '@geist-ui/react';
import { format, parseISO } from 'date-fns';
import React, { useEffect, useState } from 'react';

import { sentryException } from '../util/sentry';
import { subApiMaxCalls } from '../util/subs';
import {
	getApiUsageClient,
	SupabaseSubscription,
} from '../util/supabaseClient';
import { useUser } from '../util/useUser';
import styles from './ApiUsage.module.css';

interface ApiUsageProps {
	subscription?: SupabaseSubscription | null;
}

export function ApiUsage({ subscription }: ApiUsageProps): React.ReactElement {
	const { user } = useUser();
	const [apiCalls, setApiCalls] = useState(0);

	useEffect(() => {
		if (!user) {
			return;
		}

		getApiUsageClient(user, subscription)
			.then(setApiCalls)
			.catch(sentryException);
	}, [user, subscription]);

	return (
		<section>
			<div className={styles.textContainer}>
				<Text h5>
					API usage this month
					{subscription && (
						<>
							{' '}
							({formatDate(
								subscription.current_period_start
							)} - {formatDate(subscription.current_period_end)})
						</>
					)}
				</Text>

				<Text h4>
					<Text type="success" span>
						{apiCalls}
					</Text>
					/{subApiMaxCalls(subscription)}
				</Text>
			</div>

			<Capacity
				className={styles.capacity}
				value={(apiCalls / subApiMaxCalls(subscription)) * 100}
			/>
		</section>
	);
}

function formatDate(d: string | Date): string {
	return format(typeof d === 'string' ? parseISO(d) : d, 'do MMM yyyy');
}
