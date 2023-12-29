import { Tabs as GTabs } from "@geist-ui/react";
import React from "react";
import { dictionary, getLocale } from "@/dictionaries";
import Mail from "@geist-ui/react-icons/mail";
import Database from "@geist-ui/react-icons/database";
import GitPullRequest from "@geist-ui/react-icons/gitPullRequest";
import Lock from "@geist-ui/react-icons/lock";
import { ENABLE_BULK } from "@/util/helpers";
import { usePathname, useRouter } from "next/navigation";

export interface TabsProps {
	apiDisabled: boolean;
	bulkDisabled: boolean;
	tab: "verify" | "bulk" | "api";
}

export function Tabs({ apiDisabled, bulkDisabled, tab }: TabsProps) {
	const pathname = usePathname();
	const lang = getLocale(pathname);
	const d = dictionary(lang).dashboard.tabs;
	const router = useRouter();

	const handler = (value: string) => {
		router.push(`/dashboard/${value}`);
	};

	return ENABLE_BULK === 1 ? (
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
	) : null;
}
