import { Capacity, Text } from '@geist-ui/react';
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

		getApiUsageClient(user).then(setApiCalls).catch(sentryException);
	}, [user]);

	return (
		<section>
			<div className={styles.textContainer}>
				<Text h5>API usage this month</Text>

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
