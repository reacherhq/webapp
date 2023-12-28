import { Spacer, Text } from "@/components/Geist";
import React from "react";
import { dictionary } from "@/dictionaries";
import { getActiveProductsWithPrices } from "@/supabase/supabaseServer";
import { Plans } from "./Plans";
import { Faq } from "./Faq";

export default async function Pricing({
	params: { lang },
}: {
	params: { lang: string };
}) {
	const products = await getActiveProductsWithPrices();
	const d = dictionary(lang || "en");

	return (
		<>
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
				<Faq lang={lang} />
			</section>
		</>
	);
}
