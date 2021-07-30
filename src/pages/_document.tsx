import Document, { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

export default class extends Document {
	render(): React.ReactElement {
		return (
			<Html>
				<Head>
					<script
						async
						src="https://scripts.simpleanalyticscdn.com/latest.js"
					/>
					<script src="/crisp.js" type="text/javascript"></script>
				</Head>
				<body>
					<Main />
					<NextScript />
				</body>
			</Html>
		);
	}
}
