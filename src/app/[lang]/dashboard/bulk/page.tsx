import React from "react";
import { Dashboard } from "../Dashboard";
import { getSession, getSubscription } from "@/supabase/supabaseServer";
import { dictionary } from "@/dictionaries";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import { Csv } from "./Csv";
import { Spacer } from "@/components/Geist";
import { BulkHistory } from "./BulkHistory";
import { redirect } from "next/navigation";
import { ENABLE_BULK } from "@/util/helpers";

export default async function Bulk({
	params: { lang },
}: {
	params: { lang: string };
}) {
	if (!ENABLE_BULK) {
		return redirect(`/${lang}/dashboard/verify`);
	}

	const session = await getSession();
	if (!session) {
		return redirect(`/${lang}/login`);
	}

	const subscription = await getSubscription();
	const d = await dictionary(lang);

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
