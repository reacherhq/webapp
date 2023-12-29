import React from "react";
import { Dashboard } from "../Dashboard";
import { GetStartedSaaS } from "./GetStartedSaaS";
import { getSubscription } from "@/supabase/supabaseServer";
import { GetStartedNoPlan } from "./GetStartedNoPlan";

export default async function VerifySingle() {
	const subscription = await getSubscription();

	return (
		<Dashboard subscription={subscription} tab="verify">
			{subscription ? <GetStartedSaaS /> : <GetStartedNoPlan />}
		</Dashboard>
	);
}
