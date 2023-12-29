import React from "react";
import { Dashboard } from "../Dashboard";
import { ENABLE_BULK } from "@/util/helpers";
import { getSubscription } from "@/supabase/supabaseServer";
import { dictionary } from "@/dictionaries";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import { Csv } from "./Csv";
import { Spacer } from "@/components/Geist";
import { BulkHistory } from "./BulkHistory";

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

	const cookieStore = cookies();
	const supabase = createClient(cookieStore);
	const res = await supabase.from("bulk_jobs_info").select("*");
	if (res.error) {
		throw res.error;
	}
	const bulkJobs = res.data;

	return (
		<Dashboard d={d} subscription={subscription} tab="bulk">
			<Csv d={d} />
			<Spacer h={2} />
			<BulkHistory d={d} initialBulksJobs={bulkJobs} />
		</Dashboard>
	);
}
