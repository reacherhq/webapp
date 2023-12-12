import { Loading, Page } from "@geist-ui/react";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";

import { Dashboard, Nav } from "../components";
import { sentryException } from "@/util/sentry";
import { getActiveProductWithPrices } from "@/util/supabaseClient";
import { useUser } from "@/util/useUser";
import { ProductWithPrice } from "@/supabase/domain.types";

export const getStaticProps: GetStaticProps = async () => {
	const products = await getActiveProductWithPrices();

	return {
		props: {
			products,
		},
	};
};

interface IndexProps {
	products: ProductWithPrice[];
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
