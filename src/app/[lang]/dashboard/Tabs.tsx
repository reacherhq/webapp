"use client";

import { Tabs as GTabs } from "@geist-ui/react";
import React from "react";
import { Dictionary } from "@/dictionaries";
import Mail from "@geist-ui/react-icons/mail";
import Database from "@geist-ui/react-icons/database";
import Lock from "@geist-ui/react-icons/lock";
import { useRouter } from "next/navigation";

export interface TabsProps {
	d: Dictionary;
	bulkDisabled: boolean;
	tab: "verify" | "bulk" | "api";
}

export function Tabs({ bulkDisabled, tab, ...props }: TabsProps) {
	const router = useRouter();
	const d = props.d.dashboard.tabs;

	const handler = (value: string) => {
		router.push(`/${props.d.lang}/dashboard/${value}`);
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
							{d.bulk_locked}
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
		</GTabs>
	);
}
