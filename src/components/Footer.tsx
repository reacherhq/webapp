// TODO this should be server-side
"use client";

import { Divider, Grid, Link, Spacer, Text } from "@/components/Geist";
import Image from "next/image";
import React from "react";

import logo from "../assets/logo/reacher.svg";
import styles from "./Footer.module.css";
import { Dictionary } from "@/dictionaries";

export function Footer({ d }: { d: Dictionary }): React.ReactElement {
	return (
		<footer className={styles.container}>
			<div className={styles.top}>
				<Grid.Container justify="space-between">
					<Grid className={styles.grid} xs={5}>
						<div>
							<Image
								alt="Reacher logo"
								height={48}
								src={logo}
								width={48}
							/>
							<Spacer />
							<Text>
								{d.footer.madeby.line1}
								<br />
								{d.footer.madeby.line2}
							</Text>
						</div>
					</Grid>
					<Grid xs={4}></Grid>
					<Grid className={styles.grid} xs={5}>
						<h5>{d.footer.sitemap.title}</h5>
						<Spacer h={2} />
						<div>
							<Link href="https://reacher.email">
								{d.footer.sitemap.homepage}
							</Link>
						</div>
						<Spacer />
						<div>
							<Link href="/pricing">
								{d.footer.sitemap.pricing}
							</Link>
						</div>
						<Spacer />
						<Link
							href="https://help.reacher.email/cgu-cgv"
							target="_blank"
							rel="noopener noreferrer"
						>
							{d.footer.sitemap.tos}
						</Link>
						<Spacer />
						<Link
							href="https://help.reacher.email/politique-de-confidentialit"
							target="_blank"
							rel="noopener noreferrer"
						>
							{d.footer.sitemap.privacy}
						</Link>
						<Spacer />
						<Link
							href="https://help.reacher.email/mentions-lgales"
							target="_blank"
							rel="noopener noreferrer"
						>
							{d.footer.sitemap.legal_mentions}
						</Link>
					</Grid>
					<Grid className={styles.grid} xs={5}>
						<Text h5>{d.footer.help.title}</Text>
						<Spacer h={2} />
						<div>
							<Link
								href="https://help.reacher.email/self-host-guide"
								target="_blank"
								rel="noopener noreferrer"
							>
								{d.footer.help.self_host}
							</Link>
						</div>
						<Spacer />
						<div>
							<Link
								href="https://reacher.stoplight.io/docs/backend/76c074a57efb1-check-email"
								target="_blank"
								rel="noopener noreferrer"
							>
								{d.footer.help.api}
							</Link>
						</div>
					</Grid>
					<Grid className={styles.grid} xs={5}>
						<Text h5>{d.footer.contact.title}</Text>
						<Spacer h={2} />
						<div>
							<Link href="mailto:amaury@reacher.email">
								{d.footer.contact.email}
							</Link>
						</div>
						<Spacer />
						<div>
							<Link
								href="https://github.com/reacherhq/check-if-email-exists"
								target="_blank"
								rel="noopener noreferrer"
							>
								{d.footer.contact.github}
							</Link>
						</div>
						<Spacer />
						<div>
							<Link
								href="https://help.reacher.email"
								target="_blank"
								rel="noopener noreferrer"
							>
								{d.footer.contact.help}
							</Link>
						</div>
					</Grid>
				</Grid.Container>
			</div>

			<Spacer />
			<Divider />
			<Spacer />

			<div className={styles.bottom}>
				<Text small>© Reacher 2020-2023</Text>
				<a
					href="https://vercel.com?utm_source=reacherhq&utm_campaign=oss"
					target="_blank"
					rel="noopener noreferrer"
				>
					<img alt="Powered by Vercel" src="/powered-by-vercel.svg" />
				</a>
			</div>
			<Spacer />
		</footer>
	);
}
