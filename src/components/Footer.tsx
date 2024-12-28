import { Divider, Grid, Spacer, Text, GridContainer } from "@/components/Geist";
import Image from "next/image";
import React from "react";
import logo from "../assets/logo/reacher.svg";
import styles from "./Footer.module.css";
import { Dictionary } from "@/dictionaries";
import { DLink } from "./DLink";
import poweredByVercel from "@/assets/img/powered-by-vercel.svg";

export function Footer({ d }: { d: Dictionary }): React.ReactElement {
	return (
		<footer className={styles.container}>
			<div className={styles.top}>
				<GridContainer justify="space-between">
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
							<a href="https://reacher.email">
								{d.footer.sitemap.homepage}
							</a>
						</div>
						<Spacer />
						<div>
							<DLink href="/pricing" d={d}>
								{d.footer.sitemap.pricing}
							</DLink>
						</div>
						<Spacer />
						<DLink href="/legal/terms" d={d}>
							{d.footer.sitemap.tos}
						</DLink>
						<Spacer />
						<DLink href="/legal/privacy" d={d}>
							{d.footer.sitemap.privacy}
						</DLink>
						<Spacer />
						<DLink href="/legal/mentions" d={d}>
							{d.footer.sitemap.legal_mentions}
						</DLink>
					</Grid>
					<Grid className={styles.grid} xs={5}>
						<Text h5>{d.footer.help.title}</Text>
						<Spacer h={2} />
						<div>
							<a
								href="https://docs.reacher.email"
								target="_blank"
								rel="noopener noreferrer"
							>
								{d.footer.help.getting_started}
							</a>
						</div>
						<Spacer />
						<div>
							<a
								href="https://docs.reacher.email/self-hosting/install"
								target="_blank"
								rel="noopener noreferrer"
							>
								{d.footer.help.self_host}
							</a>
						</div>
						<Spacer />
						<div>
							<a
								href="https://docs.reacher.email/self-hosting/proxies"
								target="_blank"
								rel="noopener noreferrer"
							>
								{d.footer.help.proxies}
							</a>
						</div>
					</Grid>
					<Grid className={styles.grid} xs={5}>
						<Text h5>{d.footer.contact.title}</Text>
						<Spacer h={2} />
						<div>
							<a href="mailto:amaury@reacher.email">
								{d.footer.contact.email}
							</a>
						</div>
						<Spacer />
						<div>
							<a
								href="https://github.com/reacherhq/check-if-email-exists"
								target="_blank"
								rel="noopener noreferrer"
							>
								{d.footer.contact.github}
							</a>
						</div>
					</Grid>
				</GridContainer>
			</div>

			<Spacer />
			<Divider />
			<Spacer />

			<div className={styles.bottom}>
				<Text small>© Reacher 2020-2025</Text>
				<a
					href="https://vercel.com?utm_source=reacherhq&utm_campaign=oss"
					target="_blank"
					rel="noopener noreferrer"
				>
					<Image alt="Powered by Vercel" src={poweredByVercel} />
				</a>
			</div>
			<Spacer />
		</footer>
	);
}
