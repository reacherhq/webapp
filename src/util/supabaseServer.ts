import { createClient, User } from "@supabase/supabase-js";

import { SubscriptionWithPrice } from "@/supabase/domain.types";

export const supabaseAdmin = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL as string,
	process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export const getUser = async (jwt: string): Promise<User | null> => {
	const { data, error } = await supabaseAdmin.auth.api.getUser(jwt);

	if (error) {
		throw error;
	}

	return data;
};

export async function getActiveSubscription(
	user: User
): Promise<SubscriptionWithPrice | null> {
	const { data, error } = await supabaseAdmin
		.from<SubscriptionWithPrice>("subscriptions")
		.select("*, prices(*, products(*))")
		.in("status", ["trialing", "active", "past_due"])
		.eq("cancel_at_period_end", false)
		.eq("user_id", user.id);

	if (error) throw error;

	return data?.[0];
}
