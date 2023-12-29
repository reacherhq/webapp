import { getSubscription } from "@/supabase/supabaseServer";
import {
	COMMERCIAL_LICENSE_PRODUCT_ID,
	SAAS_100K_PRODUCT_ID,
} from "@/util/subs";
import { RedirectType, redirect } from "next/navigation";

export default async function Dashboard({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const subscription = await getSubscription();

	switch (subscription?.prices?.product_id) {
		case COMMERCIAL_LICENSE_PRODUCT_ID:
			return redirect(
				`/${lang}/dashboard/commercial_license`,
				RedirectType.replace
			);
		case SAAS_100K_PRODUCT_ID:
			return redirect(`/${lang}/dashboard/bulk`, RedirectType.replace);
		default:
			return redirect(`/${lang}/dashboard/verify`, RedirectType.replace);
	}
}
