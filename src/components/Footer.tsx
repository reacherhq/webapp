import React from 'react';

export function Footer(): React.ReactElement {
	return (
		<footer className="bg-gray">
			<div>
				<p>© Reacher 2021</p>

				<p>
					Made in a small independent studio in Paris 🇫🇷.
					<br />
					Support: ✉️{' '}
					<a href="mailto:amaury@reacher.email">
						amaury@reacher.email
					</a>
					{' - '}
					<a
						href="https://help.reacher.email"
						target="_blank"
						rel="noopener noreferrer"
					>
						Help Center
					</a>
					{' - '}
					<a
						href="https://github.com/reacherhq/check-if-email-exists"
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
