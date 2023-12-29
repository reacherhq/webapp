import { getSubscription } from "@/supabase/supabaseServer";
import { COMMERCIAL_LICENSE_PRODUCT_ID } from "@/util/subs";
import { RedirectType, redirect } from "next/navigation";

export default async function Dashboard() {
	const subscription = await getSubscription();

	switch (subscription?.prices?.product_id) {
		case COMMERCIAL_LICENSE_PRODUCT_ID:
			redirect("/dashboard/license", RedirectType.replace);
		default:
			redirect("/dashboard/verify", RedirectType.replace);
	}
}
