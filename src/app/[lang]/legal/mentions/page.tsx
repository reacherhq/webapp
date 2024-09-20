import { LegalPage } from "../LegalPage";

export default async function Mentions(p: { params: { lang: string } }) {
	return LegalPage(
		"https://raw.githubusercontent.com/reacherhq/policies/refs/heads/master/mentions/index.fr.md",
		p
	);
}
