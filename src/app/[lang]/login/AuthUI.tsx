"use client";

import { createClient } from "@/supabase/client";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import fr from "./fr.json";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dictionary } from "@/dictionaries";

export default function AuthUI({ d }: { d: Dictionary; view?: "sign_up" }) {
	const supabase = createClient();
	const router = useRouter();

	useEffect(() => {
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((event) => {
			if (event === "SIGNED_IN") {
				router.refresh();
			}
		});

		return () => subscription.unsubscribe();
	});

	return (
		<Auth
			providers={[]}
			supabaseClient={supabase}
			localization={{ variables: d.lang === "fr" ? fr : undefined }}
			view="sign_in"
			showLinks={false}
			appearance={{
				theme: ThemeSupa,
				variables: {
					default: {
						colors: {
							brand: "#404040",
							brandAccent: "#52525b",
						},
					},
				},
			}}
		/>
	);
}
