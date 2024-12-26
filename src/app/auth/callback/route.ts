import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createBrevoContact } from "@/util/brevo";
import { sentryException } from "@/util/sentry";

export async function GET(request: Request) {
	// The `/auth/callback` route is required for the server-side auth flow implemented
	// by the Auth Helpers package. It exchanges an auth code for the user's session.
	// https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-sign-in-with-code-exchange
	const requestUrl = new URL(request.url);
	const code = requestUrl.searchParams.get("code");

	if (code) {
		const cookieStore = cookies();
		const supabase = createClient(cookieStore);
		await supabase.auth.exchangeCodeForSession(code);

		// On successful sign-up, create a new contact in Brevo.
		const { data, error } = await supabase.auth.getUser();
		if (!error && data && data.user) {
			try {
				await createBrevoContact(data.user);
			} catch (err) {
				sentryException(err);
			}
		}
	}

	// URL to redirect to after sign in process completes
	return NextResponse.redirect(new URL("/dashboard", request.url));
}
