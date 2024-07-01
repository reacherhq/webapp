import { Spacer, Text } from "@/components/Geist";
import React from "react";
import { dictionary } from "@/dictionaries";
import { Nav } from "@/components/Nav/Nav";
import { Footer } from "@/components/Footer";
import { StripePricingTable } from "./StripePricingTable";

export const metadata = {
	title: "Pricing",
};

export default async function Pricing({
	params: { lang },
}: {
	params: { lang: string };
}) {
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

			<StripePricingTable />
			<Footer d={d} />
		</>
	);
}
