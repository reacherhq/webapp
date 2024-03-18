import { Page, Spacer } from "@/components/Geist";
import React from "react";
import { ApiUsage } from "./ApiUsage";
import { Tabs, TabsProps } from "./Tabs";
import { SAAS_10K_PRODUCT_ID } from "@/util/subs";
import { SubscriptionHeader } from "./SubscriptionHeader";
import { Dictionary } from "@/dictionaries";
import { ENABLE_BULK } from "@/util/helpers";
import { Tables } from "@/supabase/database.types";

interface DashboardProps {
	children: React.ReactNode;
	d: Dictionary;
	showApiUsage?: boolean;
	subAndCalls: Tables<"sub_and_calls">;
	tab: TabsProps["tab"] | false;
}
export function Dashboard({
	children,
	d,
	showApiUsage = true,
	subAndCalls,
	tab,
}: DashboardProps) {
	return (
		<Page>
			<SubscriptionHeader d={d} subAndCalls={subAndCalls} />
			<Spacer h={2} />
			{showApiUsage && (
				<>
					<ApiUsage d={d} subAndCalls={subAndCalls} />
					<Spacer h={2} />
				</>
			)}
			{tab !== false && ENABLE_BULK && (
				<Tabs
					d={d}
					bulkDisabled={
						!subAndCalls.subscription_id ||
						subAndCalls.product_id === SAAS_10K_PRODUCT_ID
					}
					tab={tab}
				/>
			)}
			{children}
		</Page>
	);
}
