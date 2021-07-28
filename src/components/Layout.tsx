import React, { ReactElement } from 'react';

import { Footer } from './Footer';
import { Head } from './Head';

export interface LayoutProps {
	children: React.ReactChild;
}

export function Layout({ children }: LayoutProps): ReactElement {
	return (
		<>
			<Head />
			<div className="p-2">
				{children}
				<Footer />
			</div>
		</>
	);
}
