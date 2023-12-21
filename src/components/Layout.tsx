import React, { ReactElement } from "react";

import { Footer } from "./Footer";
import { Nav } from "./Nav";
import Head from "next/head";

export interface LayoutProps {
	children: React.ReactChild;
}

export function Layout({ children }: LayoutProps): ReactElement {
	return (
		<>
			<Head>
				<title>Reacher Dashboard</title>
			</Head>
			<Nav />
			{children}
			<Footer />
		</>
	);
}
