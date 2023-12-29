import { Button, Select, Spacer, Text } from "@/components/Geist";
import Image from "next/image";
import React from "react";
import logo from "@/assets/logo/reacher.svg";
import { sentryException } from "@/util/sentry";
import styles from "./Nav.module.css";
import Link from "next/link";
import { dictionary } from "@/dictionaries";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { Locale } from "./Locale";

export async function Nav() {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);

	const {
		data: { user },
	} = await supabase.auth.getUser();

	const d = dictionary("en");

	return (
		<header className={styles.container}>
			<div>
				<Link
					className="flex"
					href={user ? "/" : "https://reacher.email"}
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
				</Link>
			</div>

			<div className={styles.filler} />

			<div>
				<Link
					className={styles.link}
					href="/pricing"
					data-sa-link-event="nav:pricing:click"
				>
					{d.nav.pricing}
				</Link>

				<Link
					className={styles.link}
					href="https://help.reacher.email"
					target="_blank"
					rel="noopener noreferrer"
					data-sa-link-event="nav:help:click"
				>
					{d.nav.help}
				</Link>
				<Locale />
			</div>

			<Spacer w={2} />
			{user ? (
				<Select className={styles.dropdown} placeholder={user.email}>
					<Select.Option
						onClick={() => {
							supabase.auth
								.signOut()
								.then(() => redirect("/login"))
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
					<Spacer w={0.5} />
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
