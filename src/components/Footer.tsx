/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { Divider, Grid, Link, Spacer, Text } from "@geist-ui/react";
import Image from "next/image";
import React from "react";

import logo from "../assets/logo/reacher.svg";
import styles from "./Footer.module.css";

export function Footer(): React.ReactElement {
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
								Made by Amaury, an indie
								<br />
								developer based in Paris 🇫🇷.
							</Text>
						</div>
					</Grid>
					<Grid xs={4}></Grid>
					<Grid className={styles.grid} xs={5}>
						<Text h5>Sitemap</Text>
						<Spacer y={2} />
						<div>
							<Link href="https://reacher.email">Home</Link>
						</div>
						<Spacer />
						<div>
							<Link href="/pricing">Pricing</Link>
						</div>
					</Grid>
					<Grid className={styles.grid} xs={5}>
						<Text h5>Help Center</Text>
						<Spacer y={2} />
						<div>
							<Link
								href="https://help.reacher.email/self-host-guide"
								target="_blank"
								rel="noopener noreferrer"
							>
								Self-Host
							</Link>
						</div>
						<Spacer />
						<div>
							<Link
								href="https://help.reacher.email/terms-of-service"
								target="_blank"
								rel="noopener noreferrer"
							>
								Terms of Service
							</Link>
						</div>
						<Spacer />
						<div>
							<Link
								href="https://help.reacher.email/privacy-policy"
								target="_blank"
								rel="noopener noreferrer"
							>
								Privacy Policy
							</Link>
						</div>
					</Grid>
					<Grid className={styles.grid} xs={5}>
						<Text h5>Contact</Text>
						<Spacer y={2} />
						<div>
							<Link href="mailto:amaury@reacher.email">
								Email
							</Link>
						</div>
						<Spacer />
						<div>
							<Link
								href="https://github.com/reacherhq/check-if-email-exists"
								target="_blank"
								rel="noopener noreferrer"
							>
								Github
							</Link>
						</div>
						<Spacer />
						<div>
							<Link
								href="https://help.reacher.email"
								target="_blank"
								rel="noopener noreferrer"
							>
								Help Center
							</Link>
						</div>
					</Grid>
				</Grid.Container>
			</div>

			<Spacer />
			<Divider />
			<Spacer />

			<div className={styles.bottom}>
				<Text small>
					© Reacher 2020-2022,{" "}
					<Link
						href="https://help.reacher.email/mentions-lgales"
						target="_blank"
						rel="noopener noreferrer"
					>
						Mentions légales
					</Link>
					,{" "}
					<Link
						href="https://help.reacher.email/cgu-cgv"
						target="_blank"
						rel="noopener noreferrer"
					>
						CGU/CGV
					</Link>
					,{" "}
					<Link
						href="https://help.reacher.email/politique-de-confidentialit"
						target="_blank"
						rel="noopener noreferrer"
					>
						Politique de Confidentialité
					</Link>
				</Text>
				<a
					href="https://vercel.com?utm_source=devsincrypto&utm_campaign=oss"
					target="_blank"
					rel="noopener noreferrer"
				>
					<img src="/powered-by-vercel.svg" />
				</a>
			</div>
			<Spacer />
		</footer>
	);
}
