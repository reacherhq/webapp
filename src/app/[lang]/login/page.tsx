import AuthUI from "./AuthUI";

import { redirect } from "next/navigation";
import { Page, Card } from "@/components/Geist";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

export default async function SignIn() {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (session) {
		return redirect("/dashboard");
	}

	return (
		<Page>
			<Card>
				<AuthUI />
			</Card>
		</Page>
	);
}
