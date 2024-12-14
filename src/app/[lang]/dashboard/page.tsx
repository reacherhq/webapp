import { getSubscription, getSupabaseUser } from "@/supabase/supabaseServer";
import { ENABLE_BULK } from "@/util/helpers";
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
	const user = await getSupabaseUser();

	switch (subscription?.prices?.product_id) {
		case COMMERCIAL_LICENSE_PRODUCT_ID:
			return redirect(
				`/${lang}/dashboard/commercial_license`,
				RedirectType.replace
			);
		case SAAS_100K_PRODUCT_ID:
			return redirect(
				`/${lang}/dashboard/${ENABLE_BULK ? "bulk" : "verify"}`,
				RedirectType.replace
			);
		default:
			if (
				user.user_metadata?.emailVolume === undefined ||
				user.user_metadata?.emailVolume === "SAAS_10K"
			) {
				return redirect(
					`/${lang}/dashboard/verify`,
					RedirectType.replace
				);
			} else {
				return redirect(
					`/${lang}/dashboard/commercial_license`,
					RedirectType.replace
				);
			}
	}
}
