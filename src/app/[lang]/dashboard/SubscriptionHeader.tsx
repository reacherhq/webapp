import { Text } from "@geist-ui/react";
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
import { SubscriptionWithPrice } from "@/supabase/supabaseServer";
import { DLink } from "@/components/DLink";

interface SubscriptionHeaderProps {
	d: Dictionary;
	subscription: SubscriptionWithPrice | null;
}

export function SubscriptionHeader({
	d,
	subscription,
}: SubscriptionHeaderProps): React.ReactElement {
	return (
		<section className={styles.plan}>
			<div>
				<Text h2>{d.dashboard.header.hello}</Text>
				<Text p>
					<span>
						{subscription
							? d.dashboard.header.thanks_for_subscription.replace(
									"%s",
									productName(
										subscription?.prices?.product_id,
										d
									)
							  )
							: d.dashboard.header.thanks_for_signup}
					</span>
				</Text>
				{subscription && (
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
				<Text className="text-right" p>
					{d.dashboard.header.active_subscription}
				</Text>
				<Text className="text-right" h3>
					{productName(subscription?.prices?.product_id, d)}
				</Text>
				{subscription?.status === "active" && subscription?.cancel_at && (
					<Text p small em className="text-right mt-0">
						{d.dashboard.header.plan_ends_on.replace(
							"%s",
							formatDate(new Date(subscription.cancel_at), d.lang)
						)}
					</Text>
				)}
				{subscription?.prices?.product_id !==
					COMMERCIAL_LICENSE_PRODUCT_ID && (
					<div className="text-right">
						<DLink
							d={d}
							href="/pricing"
							data-sa-link-event="dashboard:upgrade:click"
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
