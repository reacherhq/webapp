import { type NextRequest } from "next/server";
import { createClient } from "@/supabase/middleware";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

const locales = ["en", "fr"];
const defaultLocale = "en";

export async function middleware(request: NextRequest) {
	// Step 1. Locale.
	// Followed:
	// https://nextjs.org/docs/app/building-your-application/routing/internationalization

	// Check if there is any supported locale in the pathname
	console.log(request.nextUrl);
	const { pathname } = request.nextUrl;
	const pathnameHasLocale = locales.some(
		(locale) =>
			pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
	);

	if (!pathnameHasLocale) {
		// Redirect if there is no locale
		const locale = getLocale(request);
		request.nextUrl.pathname = `/${locale}${pathname}`;
		// e.g. incoming request is /products
		// The new URL is now /en/products
		return Response.redirect(request.nextUrl);
	}

	// Step 2. SUPABASE
	const { supabase, response } = createClient(request);

	// Refresh session if expired - required for Server Components
	// https://supabase.com/docs/guides/auth/auth-helpers/nextjs#managing-session-with-middleware
	await supabase.auth.getSession();

	return response;
}

export const config = {
	matcher: [
		// Skip all internal paths (_next)
		"/((?!_next).*)",
		// Optional: only run on root (/) URL
		// '/'
	],
};

function getLocale({ headers }: NextRequest): string {
	const languages = new Negotiator({
		headers: {
			"accept-language": headers.get("accept-language") || undefined,
		},
	}).languages();

	console.log("aaa", match(languages, locales, defaultLocale));

	return match(languages, locales, defaultLocale);
}
