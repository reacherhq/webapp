import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import { sentryException } from '../util/sentry';
import { useUser } from '../util/useUser';

export function Nav(): React.ReactElement {
	const { user, signOut } = useUser();
	const router = useRouter();

	return (
		<header className="navbar">
			<section className="navbar-section">
				<Link href="/">
					<a href="#" className="navbar-brand mr-2">
						Devs in Crypto
					</a>
				</Link>
				<Link href="/pricing">
					<button className="btn btn-link">Pricing</button>
				</Link>
				<Link href="/analysis">
					<button className="btn btn-link">Analysis</button>
				</Link>
				<Link href="/faq">
					<button className="btn btn-link">FAQ</button>
				</Link>
			</section>
			<section className="navbar-section">
				{user ? (
					<div className="dropdown dropdown-right">
						<button className="btn btn-link dropdown-toggle">
							My Account
						</button>

						<ul className="menu">
							<li className="menu-item">
								<div className="chip">
									<figure
										className="avatar avatar-sm"
										data-initial={user.email?.slice(0, 2)}
									></figure>
									{user.email}
								</div>
							</li>
							<li className="menu-item">
								<Link href="/account">Dashboard</Link>
							</li>
							<li className="menu-item">
								<a
									href="#"
									onClick={() =>
										signOut()
											.then(() => router.push('/'))
											.catch(sentryException)
									}
								>
									Sign out
								</a>
							</li>
						</ul>
					</div>
				) : (
					<>
						<Link href="/signin">
							<button className="btn btn-sm">Sign In</button>
						</Link>
						<Link href="/signup">
							<button className="btn btn-sm">Sign Up</button>
						</Link>
					</>
				)}
			</section>
		</header>
	);
}
