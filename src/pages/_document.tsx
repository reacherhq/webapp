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
