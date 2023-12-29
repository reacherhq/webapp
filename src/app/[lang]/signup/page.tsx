import React from "react";
import { dictionary } from "@/dictionaries";
import { redirect } from "next/navigation";
import { getSession } from "@/supabase/supabaseServer";
import SignUp from "./Signup";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav/Nav";

export default async function SignUpPage({
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
			<SignUp d={d} />
			<Footer d={d} />
		</>
	);
}
