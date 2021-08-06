import { Loading, Page } from '@geist-ui/react';
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
	const { user, userFinishedLoading } = useUser();
	const [isResetPW, setIsResetPW] = useState(false);

	useEffect(() => {
		if (isResetPW || user) {
			return;
		}

		// Password recovery.
		// https://supabase.io/docs/reference/javascript/reset-password-email#notes
		if (typeof window !== 'undefined' && window.location.hash) {
			const hashComponents = parseHashComponents(window.location.hash);
			if (
				hashComponents.type === 'recovery' &&
				hashComponents.access_token
			) {
				setIsResetPW(true);
				router
					.replace(`/reset_password_part_two${window.location.hash}`)
					.catch(sentryException);
			}
		} else if (userFinishedLoading && !user) {
			router.replace('/login').catch(sentryException);
		}
	}, [isResetPW, router, userFinishedLoading, user]);

	return (
		<>
			<Nav />
			{user && !isResetPW ? (
				<Dashboard products={products} />
			) : (
				<Page>
					<Loading />
				</Page>
			)}
		</>
	);
}
