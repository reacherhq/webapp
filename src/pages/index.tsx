import { Loading, Page } from '@geist-ui/react';
import { GetStaticProps } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect } from 'react';
import { useState } from 'react';

import { Nav } from '../components';
import { parseHashComponents } from '../util/helpers';
import { sentryException } from '../util/sentry';
import { getActiveProductsWithPrices } from '../util/supabaseClient';
import { useUser } from '../util/useUser';

export const getStaticProps: GetStaticProps = async () => {
	const products = await getActiveProductsWithPrices();

	return {
		props: {
			products,
		},
	};
};

export default function Index(): React.ReactElement {
	const router = useRouter();
	const { user, userFinishedLoading } = useUser();
	const [isRedirecting, setIsRedirecting] = useState(false);

	useEffect(() => {
		if (isRedirecting) {
			return;
		}

		const hashComponents =
			typeof window !== 'undefined' && window.location.hash
				? parseHashComponents(window.location.hash)
				: {};

		// Password recovery.
		// https://supabase.io/docs/reference/javascript/reset-password-email#notes
		if (
			hashComponents.access_token &&
			(hashComponents.type === 'invite' ||
				hashComponents.type === 'recovery')
		) {
			setIsRedirecting(true);
			router
				.replace(`/reset_password_part_two${window.location.hash}`)
				.catch(sentryException);
		} else if (userFinishedLoading && !user) {
			setIsRedirecting(true);
			router.replace('/login').catch(sentryException);
		} else if (userFinishedLoading && user) {
			setIsRedirecting(true);
			router.replace('/dashboard').catch(sentryException);
		}
	}, [isRedirecting, router, userFinishedLoading, user]);

	return (
		<>
			<Nav />
			<Page>
				<Loading />
			</Page>
		</>
	);
}
