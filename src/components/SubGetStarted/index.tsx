import React from "react";

import { COMMERCIAL_LICENSE_PRODUCT_ID } from "@/util/subs";
import { GetStartedLicense } from "./GetStartedLicense";
import { GetStartedSaas } from "./GetStartedSaas";
import { SubscriptionWithPrice } from "@/supabase/domain.types";

interface SubGetStartedProps {
	subscription: SubscriptionWithPrice | null; // null means Free Trial
}

export function SubGetStarted({
	subscription,
}: SubGetStartedProps): React.ReactElement {
	return subscription?.prices?.products?.id ===
		COMMERCIAL_LICENSE_PRODUCT_ID ? (
		<GetStartedLicense />
	) : (
		<GetStartedSaas />
	);
}
