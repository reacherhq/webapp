import { Tabs as GTabs } from "@geist-ui/react";
import React from "react";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";
import Mail from "@geist-ui/react-icons/mail";
import Database from "@geist-ui/react-icons/database";
import GitPullRequest from "@geist-ui/react-icons/gitPullRequest";
import Lock from "@geist-ui/react-icons/lock";
import { sentryException } from "@/util/sentry";
import { ENABLE_BULK } from "@/util/helpers";

export interface TabsProps {
	apiDisabled: boolean;
	bulkDisabled: boolean;
	tab: "verify" | "bulk" | "api";
}

export function Tabs({
	apiDisabled,
	bulkDisabled,
	tab,
}: TabsProps): React.ReactElement {
	const router = useRouter();
	const d = dictionary(router.locale).dashboard.tabs;

	const handler = (value: string) => {
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
			{ENABLE_BULK === 1 && (
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
			)}
			<GTabs.Item
				disabled={apiDisabled}
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
