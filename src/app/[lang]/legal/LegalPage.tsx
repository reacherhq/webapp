import axios from "axios";

import { Md } from "./Md";
import { Nav } from "@/components/Nav/Nav";
import { Page } from "@/components/Geist";
import { dictionary } from "@/dictionaries";
import { Footer } from "@/components/Footer";
import { removeFrontMatter } from "@/components/Markdown";
import { getSession } from "@/supabase/supabaseServer";

export async function LegalPage(
	contentUrl: string,
	{
		params: { lang },
	}: {
		params: { lang: string };
	}
) {
	const { data } = await axios.get(contentUrl);
	const content = removeFrontMatter(data);
	const d = await dictionary(lang);
	const session = await getSession();

	return (
		<>
			<Nav d={d} user={session?.user} />
			<Page>
				<Md>{content}</Md>
			</Page>
			<Footer d={d} />
		</>
	);
}
