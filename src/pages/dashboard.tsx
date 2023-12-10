import { Loading, Page } from "@geist-ui/react";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { Dashboard, Nav } from "../components";
import { sentryException } from "@/util/sentry";
import {
	getActiveProductsWithPrices,
	SupabaseProductWithPrice,
} from "@/util/supabaseClient";
import { useUser } from "@/util/useUser";

export const getStaticProps: GetStaticProps = async () => {
	const products = await getActiveProductsWithPrices();

	return {
		props: {
			products,
		},
	};
};

interface IndexProps {
	products: SupabaseProductWithPrice[];
}

export default function Index({ products }: IndexProps): React.ReactElement {
	const router = useRouter();
	const { user, userFinishedLoading } = useUser();

	useEffect(() => {
		if (userFinishedLoading && !user) {
			router.replace("/login").catch(sentryException);
		}
	}, [router, userFinishedLoading, user]);

	return (
		<>
			<Nav />
			{user ? (
				<Dashboard products={products} />
			) : (
				<Page>
					<Loading />
				</Page>
			)}
		</>
	);
}
