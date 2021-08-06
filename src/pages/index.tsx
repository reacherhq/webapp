import { Loading } from '@geist-ui/react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useState } from 'react';

import { Dashboard, Nav } from '../components';
import { parseHashComponents } from '../util/helpers';
import { sentryException } from '../util/sentry';
import {
	getActiveProductsWithPrices,
	SupabaseProductWithPrice,
} from '../util/supabaseClient';
import { useUser } from '../util/useUser';

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
	const { user } = useUser();
	const [isRedirecting, setIsRedirecting] = useState(true);

	useEffect(() => {
		setIsRedirecting(true);
		// Password recovery.
		// https://supabase.io/docs/reference/javascript/reset-password-email#notes
		if (typeof window !== 'undefined' && window.location.hash) {
			const hashComponents = parseHashComponents(window.location.hash);
			if (hashComponents.access_token) {
				router
					.replace(`/reset_password_part_two${window.location.hash}`)
					.then(() => setIsRedirecting(false))
					.catch(sentryException);
			}
		} else if (!user) {
			router
				.replace('/login')
				.then(() => setIsRedirecting(false))
				.catch(sentryException);
		} else {
			setIsRedirecting(false);
		}
	}, [router, user]);

	return (
		<>
			<Nav />
			{!isRedirecting ? <Dashboard products={products} /> : <Loading />}
		</>
	);
}
