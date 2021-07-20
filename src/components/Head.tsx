import NextHead from 'next/head';
import React from 'react';

export function Head(): React.ReactElement {
	return (
		<NextHead>
			<meta charSet="utf-8" />
			<link
				rel="stylesheet"
				href="https://unpkg.com/spectre.css/dist/spectre.min.css"
			></link>
			<link
				rel="stylesheet"
				href="https://unpkg.com/spectre.css/dist/spectre-icons.min.css"
			></link>
		</NextHead>
	);
}
