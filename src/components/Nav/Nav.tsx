import React from "react";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import { Button, Select, SelectOption, Spacer, Text } from "@/components/Geist";
import Image from "next/image";
import logo from "@/assets/logo/reacher.svg";
import styles from "./Nav.module.css";
import Link from "next/link";
import { Dictionary } from "@/dictionaries";
import { Locale } from "./Locale";
import { SignOut } from "./SignOut";

export async function Nav({ d }: { d: Dictionary }) {
	const cookieStore = cookies();
	const supabase = createClient(cookieStore);

	const {
		data: { user },
	} = await supabase.auth.getUser();

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
					<SelectOption value="logout">
						<SignOut d={d} />
					</SelectOption>
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
