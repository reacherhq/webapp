import Link from 'next/link';
import React from 'react';

import { useUser } from '../util/useUser';
import styles from './Bf2022.module.css';

export const Bf2002 = () => {
	const { user } = useUser();

	return (
		<div className={styles.banner}>
			BLACK FRIDAY:{' '}
			<strong>
				<u>20% off everything</u>
			</strong>{' '}
			for first 3 months. Code:{' '}
			<strong>
				RCHBF2022 &nbsp;&nbsp;&nbsp;
				{user ? (
					<Link
						href="/pricing"
						data-sa-link-event="nav:RCHBF2022:click"
					>
						Shop now →
					</Link>
				) : (
					<Link
						href="/signup"
						data-sa-link-event="nav:RCHBF2022:click"
					>
						Sign up now →
					</Link>
				)}
			</strong>
		</div>
	);
};
