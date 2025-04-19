import { dictionary } from "@/dictionaries";
import React from "react";
import { GetStartedTrial } from "./GetStartedTrial";
import { Dashboard } from "../Dashboard";
import {
	getSession,
	getSubAndCalls,
	getUserDetails,
} from "@/supabase/supabaseServer";
import { redirect } from "next/navigation";
import { COMMERCIAL_LICENSE_PRODUCT_ID } from "@/util/subs";
import { GetStartedPaid } from "./GetStartedPaid";

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
	const userDetails = await getUserDetails();
	const d = await dictionary(lang);

	return (
		<Dashboard
			d={d}
			subAndCalls={subAndCalls}
			showApiUsage={false}
			tab="commercial_license"
		>
			{subAndCalls.product_id === COMMERCIAL_LICENSE_PRODUCT_ID ? (
				<GetStartedPaid
					lang={lang}
					d={d}
					user={session.user}
					userDetails={userDetails}
					subAndCalls={subAndCalls}
				/>
			) : (
				<GetStartedTrial
					d={d}
					user={session.user}
					userDetails={userDetails}
				/>
			)}
		</Dashboard>
	);
}
