import { getSubscription } from "@/supabase/supabaseServer";
import { COMMERCIAL_LICENSE_PRODUCT_ID } from "@/util/subs";
import { RedirectType, redirect } from "next/navigation";

export default async function Dashboard({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const subscription = await getSubscription();

	switch (subscription?.prices?.product_id) {
		case COMMERCIAL_LICENSE_PRODUCT_ID:
			redirect(`/${lang}/dashboard/license`, RedirectType.replace);
		default:
			redirect(`/${lang}/dashboard/verify`, RedirectType.replace);
	}
}
