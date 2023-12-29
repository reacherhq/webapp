import { createClient } from "@/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Index({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);
	const session = await supabase.auth.getSession();

	if (session) {
		return redirect(`/${lang}/dashboard/verify`);
	} else {
		return redirect(`/${lang}/login`);
	}
}
