import { LegalPage } from "../LegalPage";

export default async function Terms(p: { params: { lang: string } }) {
	return LegalPage(
		"https://raw.githubusercontent.com/reacherhq/policies/refs/heads/master/terms/index.fr.md",
		p
	);
}
