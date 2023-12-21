import { CssBaseline } from "@geist-ui/react";
import Document, {
	DocumentContext,
	DocumentInitialProps,
	Html,
	Main,
	NextScript,
	Head,
} from "next/document";
import React from "react";

export const getInitialProps = async (
	ctx: DocumentContext
): Promise<DocumentInitialProps> => {
	const initialProps = await Document.getInitialProps(ctx);
	const styles = CssBaseline.flush(); // eslint-disable-line

	return {
		...initialProps,
		styles: (
			<>
				{initialProps.styles}
				{styles}
			</>
		),
	};
};

export default class MyDocument extends Document {
	render(): React.ReactElement {
		return (
			<Html>
				<Head>
					<meta charSet="utf-8" />

					<link rel="shortcut icon" href="/favicon.png" />

					<link
						rel="stylesheet"
						href="https://unpkg.com/spectre.css/dist/spectre.min.css"
					></link>
					<link
						rel="stylesheet"
						href="https://unpkg.com/spectre.css/dist/spectre-icons.min.css"
					></link>
				</Head>
				<body>
					<Main />
					<NextScript />
					<script
						async
						src="https://scripts.simpleanalyticscdn.com/latest.js"
					/>
					<script
						async
						src="https://scripts.simpleanalyticscdn.com/auto-events.js"
					></script>
					<script
						async
						src="/js/simpleanalytics.js"
						type="text/javascript"
					></script>
				</body>
			</Html>
		);
	}
}
