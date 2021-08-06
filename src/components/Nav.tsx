/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { ButtonDropdown, Link as GLink, Text } from '@geist-ui/react';
import Image from 'next/image';
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
				<a className="flex" href="/">
					<Image height={24} src={logo} width={24} />
					<Text className={styles.reacher} h3>
						Reacher
						{user && (
							<Text span type="secondary">
								Dashboard
							</Text>
						)}
					</Text>
				</a>
			</div>

			<div className={styles.filler} />

			<div>
				<GLink className={styles.link} href="/pricing">
					Pricing
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
