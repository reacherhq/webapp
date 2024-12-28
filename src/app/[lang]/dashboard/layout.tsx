import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav/Nav";
import { dictionary } from "@/dictionaries";
import { getSession } from "@/supabase/supabaseServer";
import React from "react";

export const metadata = {
	title: "Dashboard",
};

export default async function Layout({
	children,
	params: { lang },
}: {
	children: React.ReactNode;
	params: { lang: string };
}) {
	const d = await dictionary(lang);
	const session = await getSession();

	return (
		<>
			<Nav d={d} page="dashboard" user={session?.user} />
			{children}
			<Footer d={d} />
		</>
	);
}
