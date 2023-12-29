"use client";

import { createClient } from "@/supabase/client";
import { getWebappURL } from "@/util/helpers";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";

export default function AuthUI() {
	const supabase = createClient();

	return (
		<Auth
			supabaseClient={supabase}
			providers={[]}
			redirectTo={`${getWebappURL()}/auth/callback`}
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
