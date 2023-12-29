"use client";

import { Page, Spacer } from "@geist-ui/react";
import React from "react";
import { ApiUsage } from "./ApiUsage";
import { Tabs, TabsProps } from "./Tabs";
import { SubscriptionWithPrice } from "@/supabase/domain.types";
import { SAAS_10K_PRODUCT_ID } from "@/util/subs";
import { SubscriptionHeader } from "./SubscriptionHeader";

interface DashboardProps {
	children: React.ReactNode;
	subscription: SubscriptionWithPrice | null;
	tab: TabsProps["tab"];
}
export function Dashboard({ children, subscription, tab }: DashboardProps) {
	return (
		<Page>
			<SubscriptionHeader subscription={subscription} />
			<Spacer h={2} />
			{subscription && (
				<>
					<ApiUsage subscription={subscription} />
					<Spacer h={2} />
				</>
			)}
			<Tabs
				bulkDisabled={
					!subscription ||
					subscription?.prices.product_id === SAAS_10K_PRODUCT_ID
				}
				apiDisabled={!subscription}
				tab={tab}
			/>
			{children}
		</Page>
	);
}
