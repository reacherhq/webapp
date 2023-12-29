import { dictionary } from "@/dictionaries";
import React from "react";
import { GetStartedCommercial } from "./GetStartedCommercial";
import { Dashboard } from "../Dashboard";
import { getSession, getSubscription } from "@/supabase/supabaseServer";
import { redirect } from "next/navigation";

export default async function CommercialLicensePage({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const session = await getSession();
	if (!session) {
		return redirect(`/${lang}/login`);
	}

	const subscription = await getSubscription();
	const d = await dictionary(lang);

	return (
		<Dashboard
			d={d}
			subscription={subscription}
			showApiUsage={false}
			tab={false}
		>
			<GetStartedCommercial d={d} />
		</Dashboard>
	);
}
