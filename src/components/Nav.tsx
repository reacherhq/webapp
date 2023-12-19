/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Button, Link as GLink, Select, Spacer, Text } from "@geist-ui/react";
import Image from "next/image";
import { useRouter } from "next/router";
import React from "react";

import logo from "../assets/logo/reacher.svg";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";
import styles from "./Nav.module.css";
import Link from "next/link";
import { dictionary } from "@/dictionaries";

export function Nav(): React.ReactElement {
	const { user, userDetails, signOut } = useUser();
	const router = useRouter();
	const d = dictionary(router.locale);

	return (
		<header className={styles.container}>
			<div>
				<a
					className="flex"
					href={user ? "/dashboard" : "https://reacher.email"}
				>
					<Image
						alt="Reacher logo"
						height={24}
						src={logo}
						width={24}
					/>
					<Text className={styles.reacher} h3>
						Reacher
						{user && (
							<Text
								className={styles.dashboard}
								span
								type="secondary"
							>
								Dashboard
							</Text>
						)}
					</Text>
					<Spacer x={0.5} />
				</a>
			</div>

			<div className={styles.filler} />

			<div>
				<GLink
					className={styles.link}
					href="/pricing"
					data-sa-link-event="nav:pricing:click"
				>
					{d.nav.pricing}
				</GLink>

				<GLink
					className={styles.link}
					href="https://help.reacher.email"
					target="_blank"
					rel="noopener noreferrer"
					data-sa-link-event="nav:help:click"
				>
					{d.nav.help}
				</GLink>
			</div>
			<Spacer x={2} />
			{user ? (
				<Select
					className={styles.dropdown}
					placeholder={userDetails?.full_name || user.email}
				>
					<Select.Option
						onClick={() => {
							signOut()
								.then(() => router.push("/login"))
								.catch(sentryException);
						}}
					>
						{d.nav.logout}
					</Select.Option>
				</Select>
			) : (
				<>
					<Link href="/login">
						<Button auto>{d.nav.login}</Button>
					</Link>
					<Spacer x={0.5} />
					<Link href="/signup">
						<Button auto type="success">
							{d.nav.signup}
						</Button>
					</Link>
				</>
			)}
		</header>
	);
}
