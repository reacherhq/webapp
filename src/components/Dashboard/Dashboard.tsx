import { Page, Spacer } from "@geist-ui/react";
import React from "react";
import { ApiUsage, SubscriptionHeader, Tabs } from "@/components/Dashboard";
import { TabsProps } from "./Tabs";
import { SubscriptionWithPrice } from "@/supabase/domain.types";
import { SAAS_10K_PRODUCT_ID } from "@/util/subs";
import { GetStartedNoPlan } from "./GetStartedNoPlan";

interface DashboardProps {
	children: React.ReactNode;
	subscription: SubscriptionWithPrice | null;
	tab: TabsProps["tab"];
}
export function Dashboard({
	children,
	subscription,
	tab,
}: DashboardProps): React.ReactElement {
	return (
		<Page>
			<SubscriptionHeader subscription={subscription} />
			<Spacer y={2} />
			{subscription && (
				<>
					<ApiUsage subscription={subscription} />
					<Spacer y={2} />
				</>
			)}

			<Tabs
				bulkDisabled={
					subscription?.prices.product_id === SAAS_10K_PRODUCT_ID
				}
				tab={tab}
			/>
			{subscription ? children : <GetStartedNoPlan />}
		</Page>
	);
}
