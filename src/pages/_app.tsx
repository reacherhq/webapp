import '../styles/global.css';

import type { AppProps } from 'next/app';
import React from 'react';

import { Layout } from '../components';
import { UserContextProvider } from '../util/useUser';

export default function MyApp({
	Component,
	pageProps,
}: AppProps): React.ReactElement {
	return (
		<UserContextProvider>
			<Layout>
				<Component {...pageProps} />
			</Layout>
		</UserContextProvider>
	);
}
