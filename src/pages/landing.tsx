import { Nav } from "@/components/Nav";
import { dictionary } from "@/dictionaries";
import { useRouter } from "next/router";

export default function Landing() {
	const { locale } = useRouter();
	const d = dictionary(locale);

	return (
		<>
			<Nav />
			<section>
				<h1>
					{d.index.hero.line1}
					<br />
					{d.index.hero.line2}
				</h1>
			</section>
		</>
	);
}
