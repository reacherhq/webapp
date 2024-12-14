import { dictionary } from "@/dictionaries";
import React from "react";
import { GetStartedCommercial } from "./GetStartedCommercial";
import { Dashboard } from "../Dashboard";
import { getSession, getSubAndCalls } from "@/supabase/supabaseServer";
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

	const subAndCalls = await getSubAndCalls(session.user.id);
	const d = await dictionary(lang);

	return (
		<Dashboard
			d={d}
			subAndCalls={subAndCalls}
			showApiUsage={false}
			tab="commercial_license"
		>
			<GetStartedCommercial d={d} session={session} />
		</Dashboard>
	);
}
