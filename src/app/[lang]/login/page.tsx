import AuthUI from "./AuthUI";

import { redirect } from "next/navigation";
import { Page, Card } from "@/components/Geist";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import { Nav } from "@/components/Nav/Nav";
import { dictionary } from "@/dictionaries";

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
		return redirect("/dashboard");
	}
	const d = dictionary(lang);

	return (
		<>
			<Nav d={d} />

			<Page>
				<Card className="m-auto" width="40rem">
					<AuthUI />
				</Card>
			</Page>
		</>
	);
}
