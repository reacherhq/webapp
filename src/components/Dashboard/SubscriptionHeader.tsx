import { Text } from "@geist-ui/react";
import React from "react";
import Link from "next/link";
import { StripeMananageButton } from "./StripeManageButton";
import { COMMERCIAL_LICENSE_PRODUCT_ID, productName } from "@/util/subs";
import styles from "./Dashboard.module.css";
import { formatDate } from "@/util/helpers";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";
import { SubscriptionWithPrice } from "@/supabase/domain.types";

interface SubscriptionHeaderProps {
	subscription: SubscriptionWithPrice;
}

export function SubscriptionHeader({
	subscription,
}: SubscriptionHeaderProps): React.ReactElement {
	const router = useRouter();
	const d = dictionary(router.locale);

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
										subscription?.prices?.products,
										d
									)
							  )
							: d.dashboard.header.thanks_for_signup}
					</span>
				</Text>
				{subscription && (
					<>
						<StripeMananageButton>
							{d.dashboard.header.manage_subscription}
						</StripeMananageButton>
					</>
				)}
				<StripeMananageButton>
					{d.dashboard.header.billing_history}
				</StripeMananageButton>
			</div>
			<div>
				<Text className="text-right" p>
					{d.dashboard.header.active_subscription}
				</Text>
				<Text className="text-right" h3>
					{productName(subscription?.prices?.products, d)}
				</Text>
				{subscription?.status === "active" && subscription?.cancel_at && (
					<Text p small em className="text-right mt-0">
						{d.dashboard.header.plan_ends_on.replace(
							"%s",
							formatDate(
								new Date(subscription.cancel_at),
								router.locale
							)
						)}
					</Text>
				)}
				{subscription?.prices?.products?.id !==
					COMMERCIAL_LICENSE_PRODUCT_ID && (
					<div className="text-right">
						<Link
							href="/pricing"
							data-sa-link-event="dashboard:upgrade:click"
						>
							<strong>{d.dashboard.header.upgrade}</strong>
						</Link>
					</div>
				)}
			</div>
		</section>
	);
}
