"use client";

import { Capacity, Text } from "@geist-ui/react";
import { Loader } from "@geist-ui/react-icons";
import React from "react";
import { subApiMaxCalls } from "@/util/subs";
import styles from "./ApiUsage.module.css";
import { formatDate } from "@/util/helpers";
import { Dictionary } from "@/dictionaries";
import { Tables } from "@/supabase/database.types";

interface ApiUsageProps {
	d: Dictionary;
	subAndCalls: Tables<"sub_and_calls">;
}

export function ApiUsage({
	subAndCalls,
	d,
}: ApiUsageProps): React.ReactElement {
	return (
		<section>
			<div className={styles.textContainer}>
				<Text h5>
					{d.dashboard.emails_this_month}
					{subAndCalls.subscription_id && (
						<>
							{" "}
							(
							{formatDate(
								subAndCalls.current_period_start as string,
								d.lang
							)}{" "}
							-{" "}
							{formatDate(
								subAndCalls.current_period_end as string,
								d.lang
							)}
							)
						</>
					)}
				</Text>

				<Text h4>
					<Text type="success" span>
						{subAndCalls.number_of_calls === null ? (
							<Loader size={16} />
						) : (
							subAndCalls.number_of_calls
						)}
					</Text>
					/{subApiMaxCalls(subAndCalls.product_id)}
				</Text>
			</div>

			<Capacity
				className={styles.capacity}
				value={
					((subAndCalls.number_of_calls || 0) /
						subApiMaxCalls(subAndCalls.product_id)) *
					100
				}
			/>
		</section>
	);
}
