import AuthUI from "./AuthUI";
import { redirect } from "next/navigation";
import { Spacer, Text } from "@/components/Geist";
import { Nav } from "@/components/Nav/Nav";
import { dictionary } from "@/dictionaries";

import styles from "./page.module.css";
import { Footer } from "@/components/Footer";
import { getSession } from "@/supabase/supabaseServer";

export default async function SignIn({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const session = await getSession();
	if (session) {
		return redirect(`/${lang}/dashboard`);
	}
	const d = await dictionary(lang);

	return (
		<>
			<Nav d={d} />

			<Spacer h={5} />
			<Text className="text-center" h3>
				{d.login.title}
			</Text>
			<div className={styles.container}>
				<AuthUI d={d} />
			</div>

			<Footer d={d} />
		</>
	);
}
