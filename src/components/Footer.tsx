import React from 'react';

export function Footer(): React.ReactElement {
	return (
		<footer className="bg-gray">
			<div className="thin-container section text-center">
				<p>© Devs in Crypto 2021</p>

				<p>
					Made by a crypto dev based in Paris 🇫🇷.
					<br />
					<a href="mailto:amaury@devsincrypto.com">Support Email</a>
					{' - '}
					<a
						href="https://github.com/devsincrypto/webapp"
						target="_blank"
						rel="noopener noreferrer"
					>
						Github
					</a>
				</p>
				<a
					href="https://vercel.com?utm_source=devsincrypto&utm_campaign=oss"
					target="_blank"
					rel="noopener noreferrer"
				>
					<img src="/powered-by-vercel.svg" />
				</a>
			</div>
		</footer>
	);
}
