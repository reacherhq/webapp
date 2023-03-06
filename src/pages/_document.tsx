import { CssBaseline } from '@geist-ui/react';
import Document, {
	DocumentContext,
	DocumentInitialProps,
	Head,
	Html,
	Main,
	NextScript,
} from 'next/document';
import React from 'react';

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

export default class extends Document {
	render(): React.ReactElement {
		return (
			<Html>
				<Head />
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
						src="/js/simpleanalytics.js"
						type="text/javascript"
					></script>
				</body>
			</Html>
		);
	}
}
