import '../styles/global.css';

import { CssBaseline, GeistProvider, Themes } from '@geist-ui/react';
import type { AppProps } from 'next/app';
import React from 'react';

import { Layout } from '../components';
import { UserContextProvider } from '../util/useUser';

const myTheme = Themes.createFromLight({
	type: 'default',
	palette: {
		foreground: '#3a3a3a', // Neutral Almost Black
		success: '#6979f8', // Primary Blue
		link: '#6979f8',
	},
});

export default function MyApp({
	Component,
	pageProps,
}: AppProps): React.ReactElement {
	return (
		<GeistProvider themes={[myTheme]} themeType="default">
			<CssBaseline />
			<UserContextProvider>
				<Layout>
					<Component {...pageProps} />
				</Layout>
			</UserContextProvider>
		</GeistProvider>
	);
}
