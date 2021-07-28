import React from 'react';

import { Nav } from '../components';

export default function Index(): React.ReactElement {
	return (
		<>
			<Nav />
			<div className="hero bg-gray">
				<div className="hero-body">
					<h1>
						Access all the developers working
						<br />
						in <strong>blockchain</strong> and{' '}
						<strong>crypto</strong>.
						<br />
						Ranked.
					</h1>
					<p>
						Reacher sorts developers by blockchain ecosystems,
						<br />
						and ranks them within each ecosystem by their Github
						activity.
					</p>
				</div>
			</div>

			<div className="thin-container">
				<section className="section">
					{'<EcosystemList ecos={ecos} />'}
				</section>
			</div>
		</>
	);
}
