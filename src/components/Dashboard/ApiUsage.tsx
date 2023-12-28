import { Capacity, Text } from "@geist-ui/react";
import { Loader } from "@geist-ui/react-icons";
import React, { useEffect, useState } from "react";

import { sentryException } from "@/util/sentry";
import { subApiMaxCalls } from "@/util/subs";
import { getApiUsageClient } from "@/util/supabaseClient";
import styles from "./ApiUsage.module.css";
import { formatDate } from "@/util/helpers";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";
import { SubscriptionWithPrice } from "@/supabase/domain.types";
import { useUser } from "@/util/useUser";

interface ApiUsageProps {
	subscription: SubscriptionWithPrice;
}

export function ApiUsage({ subscription }: ApiUsageProps): React.ReactElement {
	const { supabase } = useUser();
	const [apiCalls, setApiCalls] = useState<number | undefined>(undefined); // undefined means loading
	const router = useRouter();
	const d = dictionary(router.locale).dashboard;

	useEffect(() => {
		getApiUsageClient(supabase, subscription)
			.then(setApiCalls)
			.catch(sentryException);
	}, [supabase, subscription]);

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
		</section>
	);
}
