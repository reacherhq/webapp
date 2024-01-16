"use client";

import { Capacity, Text } from "@geist-ui/react";
import { Loader } from "@geist-ui/react-icons";
import React, { useEffect, useState } from "react";
import { sentryException } from "@/util/sentry";
import { getApiUsage, subApiMaxCalls } from "@/util/subs";
import styles from "./ApiUsage.module.css";
import { formatDate } from "@/util/helpers";
import { Dictionary } from "@/dictionaries";
import { SubscriptionWithPrice } from "@/supabase/supabaseServer";
import { createClient } from "@/supabase/client";

interface ApiUsageProps {
	d: Dictionary;
	subscription: SubscriptionWithPrice | null;
}

export function ApiUsage({
	subscription,
	d,
}: ApiUsageProps): React.ReactElement {
	const supabase = createClient();
	const [apiCalls, setApiCalls] = useState<number | undefined>(undefined); // undefined means loading

	useEffect(() => {
		getApiUsage(supabase, subscription)
			.then(setApiCalls)
			.catch(sentryException);
	}, [supabase, subscription]);

	return (
		<section>
			<div className={styles.textContainer}>
				<Text h5>
					{d.dashboard.emails_this_month}
					{subscription && (
						<>
							{" "}
							(
							{formatDate(
								subscription.current_period_start,
								d.lang
							)}{" "}
							-{" "}
							{formatDate(
								subscription.current_period_end,
								d.lang
							)}
							)
						</>
					)}
				</Text>

				<Text h4>
					<Text type="success" span>
						{apiCalls === undefined ? (
							<Loader size={16} />
						) : (
							apiCalls
						)}
					</Text>
					/{subApiMaxCalls(subscription?.prices?.product_id)}
				</Text>
			</div>

			<Capacity
				className={styles.capacity}
				value={
					((apiCalls || 0) /
						subApiMaxCalls(subscription?.prices?.product_id)) *
					100
				}
			/>
		</section>
	);
}
