import React from "react";
import { Dashboard } from "../Dashboard";
import { ENABLE_BULK } from "@/util/helpers";
import { getSubscription } from "@/supabase/supabaseServer";
import { dictionary } from "@/dictionaries";
import { GetStartedBulk } from "./GetStartedBulk";

export default async function Bulk({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const subscription = await getSubscription();
	const d = await dictionary(lang);

	if (ENABLE_BULK === 0) {
		return <p>Bulk is disabled</p>;
	}

	return (
		<Dashboard d={d} subscription={subscription} tab="bulk">
			<GetStartedBulk d={d} />
		</Dashboard>
	);
}
