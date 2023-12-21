import { dictionary } from "@/dictionaries";
import { useRouter } from "next/router";

export default function Landing() {
	const router = useRouter();
	const d = dictionary(router.locale);

	return (
		<>
			<section>
				<h1>
					{d.homepage.hero.line1}
					<br />
					{d.homepage.hero.line2}
				</h1>
			</section>
		</>
	);
}
