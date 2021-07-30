import React from 'react';

import {
	SupabaseProduct,
	SupabaseSubscription,
} from '../../util/supabaseClient';
import { COMMERCIAL_LICENSE_PRODUCT_ID } from '../ProductCard';
import { GetStartedLicense } from './GetStartedLicense';
import { GetStartedSaas } from './GetStartedSaas';

export function subscriptionName(product?: SupabaseProduct): string {
	return product?.name || 'Free Trial';
}

interface SubGetStartedProps {
	subscription: SupabaseSubscription | null; // null means Free Trial
}

export function SubGetStarted({
	subscription,
}: SubGetStartedProps): React.ReactElement {
	return subscription?.prices?.products?.id ===
		COMMERCIAL_LICENSE_PRODUCT_ID ? (
		<GetStartedLicense subscription={subscription} />
	) : (
		<GetStartedSaas subscription={subscription} />
	);
}
