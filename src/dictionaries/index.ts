import en from "./en.json";
import fr from "./fr.json";

const dictionaries = { en, fr };

export type Dictionary = typeof en;

export function dictionary(locale?: string) {
	if (locale !== "en" && locale !== "fr") {
		throw new Error(`Locale '${locale}' not found.`);
	}

	return dictionaries[locale];
}

// Get locale from pathname.
export function getLocale(pathname: string | null) {
	if (!pathname) return "en";
	const segments = pathname.split("/");
	if (segments[1] === "fr") return "fr";
	return "en";
}
