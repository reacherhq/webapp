import { Capacity, Loading, Spacer, Text } from "@geist-ui/react";
import { Loader } from "@geist-ui/react-icons";
import React, { useEffect, useState } from "react";

import { sentryException } from "@/util/sentry";
import { subApiMaxCalls } from "@/util/subs";
import { getApiUsageClient } from "@/util/supabaseClient";
import { useUser } from "@/util/useUser";
import styles from "./ApiUsage.module.css";
import { Demo } from "./Demo";
import { formatDate } from "@/util/helpers";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";

export function ApiUsage(): React.ReactElement {
	const { subscription, user, userFinishedLoading } = useUser();
	const [apiCalls, setApiCalls] = useState<number | undefined>(undefined); // undefined means loading
	const router = useRouter();
	const d = dictionary(router.locale).dashboard;

	useEffect(() => {
		if (!user || !userFinishedLoading) {
			return;
		}
		getApiUsageClient(subscription)
			.then(setApiCalls)
			.catch(sentryException);
	}, [user, userFinishedLoading, subscription]);

	if (!user) {
		return <Loading />;
	}

	return (
		<section>
			<div className={styles.textContainer}>
				<Text h5>
					{d.emails_this_month}
					{subscription && (
						<>
							{" "}
							(
							{formatDate(
								subscription.current_period_start,
								router.locale
							)}{" "}
							-{" "}
							{formatDate(
								subscription.current_period_end,
								router.locale
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
					/{subApiMaxCalls(subscription)}
				</Text>
			</div>

			<Capacity
				className={styles.capacity}
				value={((apiCalls || 0) / subApiMaxCalls(subscription)) * 100}
			/>

			<Spacer />
			<Demo
				onVerified={() =>
					getApiUsageClient(subscription).then(setApiCalls)
				}
			/>
			<Spacer />
		</section>
	);
}
