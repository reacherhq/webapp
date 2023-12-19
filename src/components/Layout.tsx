import React, { ReactElement } from "react";

import { Footer } from "./Footer";
import { Head } from "./Head";
import { Nav } from "./Nav";

export interface LayoutProps {
	children: React.ReactChild;
}

export function Layout({ children }: LayoutProps): ReactElement {
	return (
		<>
			<Head />
			<Nav />
			{children}
			<Footer />
		</>
	);
}
