import "server-only";

const dictionaries = {
	en: () => import("./en.json").then((module) => module.default),
	fr: () => import("./fr.json").then((module) => module.default),
};

export type Dictionary = Awaited<ReturnType<typeof dictionaries.en>>;

export async function dictionary(locale?: string): Promise<Dictionary> {
	if (locale !== "en" && locale !== "fr") {
		throw new Error(`Locale '${locale}' not found.`);
	}

	return dictionaries[locale]();
}
