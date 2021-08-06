import React from 'react';

import { COMMERCIAL_LICENSE_PRODUCT_ID } from '../../util/subs';
import { SupabaseSubscription } from '../../util/supabaseClient';
import { GetStartedLicense } from './GetStartedLicense';
import { GetStartedSaas } from './GetStartedSaas';

interface SubGetStartedProps {
	subscription: SupabaseSubscription | null; // null means Free Trial
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
