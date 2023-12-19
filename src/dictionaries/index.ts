import en from "./en.json";
import fr from "./fr.json";

const dictionaries = { en, fr };

export function dictionary(locale?: string) {
	if (locale !== "en" && locale !== "fr") {
		throw new Error(`Locale '${locale}' not found.`);
	}

	return dictionaries[locale];
}
