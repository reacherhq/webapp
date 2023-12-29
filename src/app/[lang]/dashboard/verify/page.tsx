import React from "react";
import { Dashboard } from "../Dashboard";
import { GetStartedSaaS } from "./GetStartedSaaS";
import { getSubscription, getUserDetails } from "@/supabase/supabaseServer";
import { GetStartedNoPlan } from "./GetStartedNoPlan";
import { GetStartedApi } from "./GetStartedApi";
import { dictionary } from "@/dictionaries";
import { Spacer } from "@/components/Geist";

export default async function VerifySingle({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const subscription = await getSubscription();
	const userDetails = await getUserDetails();
	const d = await dictionary(lang);

	return (
		<Dashboard d={d} subscription={subscription} tab="verify">
			{subscription ? (
				<>
					<GetStartedSaaS userDetails={userDetails} d={d} />
					<Spacer />
					<GetStartedApi userDetails={userDetails} d={d} />
				</>
			) : (
				<GetStartedNoPlan d={d} />
			)}
		</Dashboard>
	);
}
