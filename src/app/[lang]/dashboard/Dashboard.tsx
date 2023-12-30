import { Page, Spacer } from "@/components/Geist";
import React from "react";
import { ApiUsage } from "./ApiUsage";
import { Tabs, TabsProps } from "./Tabs";
import { SAAS_10K_PRODUCT_ID } from "@/util/subs";
import { SubscriptionHeader } from "./SubscriptionHeader";
import { SubscriptionWithPrice } from "@/supabase/supabaseServer";
import { Dictionary } from "@/dictionaries";
import { ENABLE_BULK } from "@/util/helpers";

interface DashboardProps {
	children: React.ReactNode;
	d: Dictionary;
	showApiUsage?: boolean;
	subscription: SubscriptionWithPrice | null;
	tab: TabsProps["tab"] | false;
}
export function Dashboard({
	children,
	d,
	showApiUsage = true,
	subscription,
	tab,
}: DashboardProps) {
	return (
		<Page>
			<SubscriptionHeader d={d} subscription={subscription} />
			<Spacer h={2} />
			{showApiUsage && subscription && (
				<>
					<ApiUsage d={d} subscription={subscription} />
					<Spacer h={2} />
				</>
			)}
			{tab !== false && ENABLE_BULK && (
				<Tabs
					d={d}
					bulkDisabled={
						!subscription ||
						subscription?.prices?.product_id === SAAS_10K_PRODUCT_ID
					}
					tab={tab}
				/>
			)}
			{children}
		</Page>
	);
}
