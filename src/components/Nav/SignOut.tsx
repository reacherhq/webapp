"use client";

import { Dictionary } from "@/dictionaries";
import { createClient } from "@/supabase/client";
import { useRouter } from "next/navigation";

export function SignOut({ d }: { d: Dictionary }) {
	const supabase = createClient();
	const router = useRouter();
	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.refresh();
	};

	return <span onClick={handleSignOut}>{d.nav.logout}</span>;
}
