import { createClient, User } from "@supabase/supabase-js";

import {
	getUsageStartDate,
	SupabaseCall,
	SupabaseSubscription,
	SupabaseUser,
} from "./supabaseClient";

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

export const getUserByApiToken = async (
	apiToken: string
): Promise<SupabaseUser | null> => {
	const { data, error } = await supabaseAdmin
		.from<SupabaseUser>("users")
		.select("*")
		.eq("api_token", apiToken);

	if (error) {
		throw error;
	}

	return data?.[0];
};

export async function getActiveSubscription(
	user: User
): Promise<SupabaseSubscription | null> {
	const { data, error } = await supabaseAdmin
		.from<SupabaseSubscription>("subscriptions")
		.select("*, prices(*, products(*))")
		.in("status", ["trialing", "active", "past_due"])
		.eq("cancel_at_period_end", false)
		.eq("user_id", user.id);

	if (error) throw error;

	return data?.[0];
}

interface SubAndCalls {
	user_id: string;
	subscription_id: string | null;
	product_id: string | null;
	email: string;
	current_period_start: string | Date;
	current_period_end: string | Date;
	number_of_calls: number;
}

export async function getSubAndCalls(userId: string): Promise<SubAndCalls> {
	const { data, error } = await supabaseAdmin
		.from<SubAndCalls>("sub_and_calls")
		.select("*")
		.eq("user_id", userId)
		.single();
	if (error) {
		console.log("getSubAndCalls error", error);
		throw error;
	}

	return data;
}
