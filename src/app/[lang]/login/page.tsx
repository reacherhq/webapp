import AuthUI from "./AuthUI";

import { redirect } from "next/navigation";
import { Spacer } from "@/components/Geist";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import { Nav } from "@/components/Nav/Nav";
import { dictionary } from "@/dictionaries";

import styles from "./page.module.css";
import { Footer } from "@/components/Footer";

export default async function SignIn({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (session) {
		return redirect(`/${lang}/dashboard`);
	}
	const d = await dictionary(lang);

	return (
		<>
			<Nav d={d} />

			<Spacer h={5} />
			<div className={styles.container}>
				<AuthUI />
			</div>

			<Footer d={d} />
		</>
	);
}
