import { Spacer, Text } from "@/components/Geist";
import React from "react";
import { dictionary } from "@/dictionaries";
import { getActiveProductsWithPrices } from "@/supabase/supabaseServer";
import { Plans } from "./Plans";
import { Faq } from "./Faq";
import { Nav } from "@/components/Nav/Nav";
import { Footer } from "@/components/Footer";

export default async function Pricing({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const products = await getActiveProductsWithPrices();
	const d = await dictionary(lang);

	return (
		<>
			<Nav d={d} />
			<Spacer h={5} />
			<Text className="text-center" h2>
				{d.pricing.title}
			</Text>
			<Text p em className="text-center">
				{d.pricing["30d_money_back"]}
			</Text>

			<Spacer h={2} />
			<section>
				<Plans d={d} products={products} />

				<Spacer h={2} />
				<Faq d={d} />
			</section>
			<Footer d={d} />
		</>
	);
}
