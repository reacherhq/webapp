import { Text } from "@/components/Geist";
import React from "react";
import { StripeMananageButton } from "./StripeManageButton";
import {
	COMMERCIAL_LICENSE_PRODUCT_ID,
	SAAS_100K_PRODUCT_ID,
	SAAS_10K_PRODUCT_ID,
} from "@/util/subs";
import { formatDate } from "@/util/helpers";
import { Dictionary } from "@/dictionaries";

import styles from "./SubscriptionHeader.module.css";
import { DLink } from "@/components/DLink";
import { Tables } from "@/supabase/database.types";

interface SubscriptionHeaderProps {
	d: Dictionary;
	subAndCalls: Tables<"sub_and_calls">;
}

export function SubscriptionHeader({
	d,
	subAndCalls,
}: SubscriptionHeaderProps): React.ReactElement {
	return (
		<section className={styles.plan}>
			<div>
				<h2>{d.dashboard.header.hello}</h2>
				<p>
					<span>
						{subAndCalls.subscription_id
							? d.dashboard.header.thanks_for_subscription.replace(
									"%s",
									productName(subAndCalls.product_id, d)
							  )
							: d.dashboard.header.thanks_for_signup}
					</span>
				</p>
				{subAndCalls.subscription_id && (
					<>
						<StripeMananageButton d={d}>
							{d.dashboard.header.manage_subscription}
						</StripeMananageButton>
					</>
				)}
				<StripeMananageButton d={d}>
					{d.dashboard.header.billing_history}
				</StripeMananageButton>
			</div>
			<div>
				<p className="text-right">
					{d.dashboard.header.active_subscription}
				</p>
				<h3 className="text-right">
					{productName(subAndCalls.product_id, d)}
				</h3>
				{subAndCalls.status === "active" && subAndCalls.cancel_at && (
					<Text p small em className="text-right mt-0">
						{d.dashboard.header.plan_ends_on.replace(
							"%s",
							formatDate(new Date(subAndCalls.cancel_at), d.lang)
						)}
					</Text>
				)}
				{subAndCalls.product_id !== COMMERCIAL_LICENSE_PRODUCT_ID && (
					<div className="text-right">
						<DLink
							d={d}
							href="/pricing"
							data-sa-link-event="dashboard_upgrade_click"
						>
							<strong>{d.dashboard.header.upgrade}</strong>
						</DLink>
					</div>
				)}
			</div>
		</section>
	);
}

// Get the user-friendly name of a product.
function productName(
	product_id: string | null | undefined,
	d: Dictionary
): string {
	switch (product_id) {
		case COMMERCIAL_LICENSE_PRODUCT_ID:
			return d.pricing.plans.commercial_license;
		case SAAS_100K_PRODUCT_ID:
			return d.pricing.plans.saas_100k;
		case SAAS_10K_PRODUCT_ID:
			return d.pricing.plans.saas_10k;
		default:
			return d.dashboard.header.no_active_subscription;
	}
}
