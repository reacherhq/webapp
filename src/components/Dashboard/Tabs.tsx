import { Tabs as GTabs } from "@geist-ui/react";
import React from "react";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";
import Mail from "@geist-ui/react-icons/mail";
import Database from "@geist-ui/react-icons/database";
import GitPullRequest from "@geist-ui/react-icons/gitPullRequest";
import Link from "next/link";

import styles from "./Tabs.module.css";

interface TabsProps {
	bulkDisabled: boolean;
	value: "verify" | "bulk" | "api";
}

export function Tabs({ bulkDisabled, value }: TabsProps): React.ReactElement {
	const router = useRouter();
	const d = dictionary(router.locale);

	return (
		<GTabs className={styles.tabs} value={value}>
			<GTabs.Item
				label={
					<Link href="/dashboard/verify">
						<Mail />
						Verify a single email
					</Link>
				}
				value="verify"
			/>
			<GTabs.Item
				disabled={bulkDisabled}
				label={
					bulkDisabled ? (
						<>
							<Database />
							Bulk verification
						</>
					) : (
						<Link href="/dashboard/bulk">
							<Database />
							Bulk verification
						</Link>
					)
				}
				value="bulk"
			/>
			<GTabs.Item
				label={
					<Link href="/dashboard/api">
						<GitPullRequest />
						API
					</Link>
				}
				value="api"
			/>
		</GTabs>
	);
}
