import { LegalPage } from "../LegalPage";

export default async function Privacy(p: { params: { lang: string } }) {
	return LegalPage(
		"https://raw.githubusercontent.com/reacherhq/policies/refs/heads/master/privacy/index.fr.md",
		p
	);
}
