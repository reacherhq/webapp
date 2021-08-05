/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { ButtonDropdown, Link as GLink, Text } from '@geist-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import logo from '../assets/logo/reacher.svg';
import { sentryException } from '../util/sentry';
import { useUser } from '../util/useUser';
import styles from './Nav.module.css';

export function Nav(): React.ReactElement {
	const { user, userDetails, signOut } = useUser();
	const router = useRouter();

	return (
		<header className={styles.container}>
			<div>
				<Link href="/">
					<a className="flex">
						<Image height={24} src={logo} width={24} />
						<Text className={`mb-0 ${styles.reacher}`} h3>
							Reacher
						</Text>
						{user && (
							<Text className="mb-0" h3 type="secondary">
								Dashboard
							</Text>
						)}
					</a>
				</Link>
			</div>

			<div className={styles.filler} />

			<div>
				<GLink className={styles.link}>
					<Link href="/pricing">Pricing</Link>
				</GLink>

				<GLink
					className={styles.link}
					href="https://help.reacher.email"
					target="_blank"
					rel="noopener noreferrer"
				>
					Help Center
				</GLink>
			</div>
			{user && (
				<ButtonDropdown className={styles.dropdown}>
					<ButtonDropdown.Item main>
						{userDetails?.full_name || user.email}
					</ButtonDropdown.Item>
					<ButtonDropdown.Item
						onClick={() =>
							signOut()
								.then(() => router.push('/login'))
								.catch(sentryException)
						}
					>
						Log Out
					</ButtonDropdown.Item>
				</ButtonDropdown>
			)}
		</header>
	);
}
