import { Tabs as GTabs } from "@geist-ui/react";
import React from "react";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";
import Mail from "@geist-ui/react-icons/mail";
import Database from "@geist-ui/react-icons/database";
import GitPullRequest from "@geist-ui/react-icons/gitPullRequest";
import Lock from "@geist-ui/react-icons/lock";
import { sentryException } from "@/util/sentry";

export interface TabsProps {
	bulkDisabled: boolean;
	tab: "verify" | "bulk" | "api";
}

export function Tabs({ bulkDisabled, tab }: TabsProps): React.ReactElement {
	const router = useRouter();
	const d = dictionary(router.locale).dashboard.tabs;

	const handler = (value: string) => {
		console.log("Av", value);
		router
			.push(`/dashboard/${value}`, undefined, { locale: router.locale })
			.catch(sentryException);
	};

	return (
		<GTabs onChange={handler} value={tab}>
			<GTabs.Item
				label={
					<>
						<Mail />
						{d.verify}
					</>
				}
				value="verify"
			/>
			<GTabs.Item
				disabled={bulkDisabled}
				label={
					bulkDisabled ? (
						<>
							<Lock />
							{d.bulk}
						</>
					) : (
						<>
							<Database />
							{d.bulk}
						</>
					)
				}
				value="bulk"
			/>
			<GTabs.Item
				label={
					<>
						<GitPullRequest />
						{d.api}
					</>
				}
				value="api"
			/>
		</GTabs>
	);
}
