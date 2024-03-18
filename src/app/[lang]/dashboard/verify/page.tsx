import React from "react";
import { Dashboard } from "../Dashboard";
import { GetStartedSaaS } from "./GetStartedSaaS";
import {
	getSession,
	getSubAndCalls,
	getUserDetails,
} from "@/supabase/supabaseServer";
import { GetStartedApi } from "./GetStartedApi";
import { dictionary } from "@/dictionaries";
import { Spacer } from "@/components/Geist";
import { redirect } from "next/navigation";

export default async function VerifySingle({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const session = await getSession();
	if (!session) {
		return redirect(`/${lang}/login`);
	}

	const userDetails = await getUserDetails();
	const subAndCalls = await getSubAndCalls(session.user.id);
	const d = await dictionary(lang);

	return (
		<Dashboard
			showApiUsage={true}
			subAndCalls={subAndCalls}
			d={d}
			tab="verify"
		>
			<GetStartedSaaS userDetails={userDetails} d={d} />
			<Spacer />
			<GetStartedApi userDetails={userDetails} d={d} />
		</Dashboard>
	);
}
