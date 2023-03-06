/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useEffect } from 'react';

export default function Crisp(): null {
	useEffect(() => {
		// @ts-ignore
		window.$crisp = [];
		// @ts-ignore
		window.CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
		(() => {
			const d = document;
			const s = d.createElement('script');
			s.src = 'https://client.crisp.chat/l.js';
			// @ts-ignore
			s.async = 1;
			d.getElementsByTagName('body')[0].appendChild(s);
		})();
	}, []);

	return null;
}
