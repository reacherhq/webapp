"use client";

import { Capacity, Text } from "@geist-ui/react";
import { Loader } from "@geist-ui/react-icons";
import React, { useEffect, useState } from "react";
import { sentryException } from "@/util/sentry";
import { subApiMaxCalls } from "@/util/subs";
import styles from "./ApiUsage.module.css";
import { formatDate } from "@/util/helpers";
import { Dictionary } from "@/dictionaries";
import { Tables } from "@/supabase/database.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { parseISO, subMonths } from "date-fns";
import { SubscriptionWithPrice } from "@/supabase/supabaseServer";
import { createClient } from "@/supabase/client";

interface ApiUsageProps {
	d: Dictionary;
	subscription: SubscriptionWithPrice;
}

export function ApiUsage({
	subscription,
	d,
}: ApiUsageProps): React.ReactElement {
	const supabase = createClient();
	const [apiCalls, setApiCalls] = useState<number | undefined>(undefined); // undefined means loading

	useEffect(() => {
		const t = setInterval(() => {
			getApiUsageClient(supabase, subscription)
				.then(setApiCalls)
				.catch(sentryException);
		}, 3000);

		return () => clearInterval(t);
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

// Get the api calls of a user in the past month.
async function getApiUsageClient(
	supabase: SupabaseClient,
	subscription: Tables<"subscriptions"> | null
): Promise<number> {
	const { error, count } = await supabase
		.from("calls")
		.select("*", { count: "exact" })
		.gt("created_at", getUsageStartDate(subscription).toISOString());

	if (error) {
		throw error;
	}

	return count || 0;
}

// Returns the start date of the usage metering.
// - If the user has an active subscription, it's the current period's start
//   date.
// - If not, then it's 1 month rolling.
function getUsageStartDate(subscription: Tables<"subscriptions"> | null): Date {
	if (!subscription) {
		return subMonths(new Date(), 1);
	}

	return typeof subscription.current_period_start === "string"
		? parseISO(subscription.current_period_start)
		: subscription.current_period_start;
}
