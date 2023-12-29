"use client";

import { Dictionary } from "@/dictionaries";
import { createClient } from "@/supabase/client";
import { Select } from "@geist-ui/react";
import { useRouter } from "next/navigation";

import styles from "./Nav.module.css";

export function SignOut({ d, email }: { d: Dictionary; email?: string }) {
	const supabase = createClient();
	const router = useRouter();
	const handleSignOut = async () => {
		await supabase.auth.signOut();
		router.refresh();
	};

	return (
		<Select
			onChange={handleSignOut}
			className={styles.dropdown}
			placeholder={email}
		>
			<Select.Option value="logout">{d.nav.logout}</Select.Option>
		</Select>
	);
}
