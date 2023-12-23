import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";
import { Button, Card, Spacer, Table, Text } from "@geist-ui/react";
import { supabase } from "@/util/supabaseClient";
import { Tables } from "@/supabase/database.types";
import { sentryException } from "@/util/sentry";
import { formatDate } from "@/util/helpers";
import { Download } from "@geist-ui/react-icons";
import { TableColumnRender } from "@geist-ui/react/esm/table";
import Check from "@geist-ui/react-icons/check";

export function alertError(
	e: string,
	d: ReturnType<typeof dictionary>["dashboard"]["get_started_saas"]
) {
	alert(d.unexpected_error.replace("%s2", e));
}

export function BulkHistory(): React.ReactElement {
	const [bulkJobs, setBulkJobs] = useState<Tables<"bulk_jobs_info">[]>([]);
	const router = useRouter();
	const d = dictionary(router.locale).dashboard;

	useEffect(() => {
		setInterval(async () => {
			const res = await supabase
				.from<Tables<"bulk_jobs_info">>("bulk_jobs_info")
				.select("*");
			if (res.error) {
				sentryException(res.error);
				return;
			}

			setBulkJobs(res.data);
		}, 3000);
	}, []);

	return (
		<Card>
			<Text h3>My Bulk Jobs</Text>
			<Spacer />
			<Table data={bulkJobs}>
				<Table.Column prop="bulk_job_id" label="Job ID" />
				<Table.Column
					prop="verified"
					label="Status"
					render={renderStatus}
				/>
				<Table.Column prop="number_of_emails" label="Total emails" />
				<Table.Column
					prop="created_at"
					label="Uploaded"
					render={(value) => (
						<>{formatDate(value as string, router.locale)}</>
					)}
				/>
				<Table.Column
					className="text-right"
					prop="safe"
					render={renderSafe}
				>
					<Text
						className="text-right"
						span
						type="success"
						width="100%"
					>
						Safe
					</Text>
				</Table.Column>
				<Table.Column
					className="text-right"
					prop="invalid"
					label="Invalid"
					render={renderInvalid}
				/>
				<Table.Column
					className="text-right"
					prop="risky"
					label="Risky"
					render={renderRisky}
				/>
				<Table.Column
					className="text-right"
					prop="unknown"
					label="Unknown"
					render={renderUnknown}
				/>
				<Table.Column
					className="text-right"
					prop="user_id"
					label="Full Results"
					render={renderDownloadCsv}
				/>
			</Table>
		</Card>
	);
}

function IsReachable({
	children,
	type,
}: {
	children: React.ReactNode;
	type: "success" | "error" | "warning" | "secondary";
}) {
	return (
		<Text className="text-right" span type={type} width="100%">
			{children}
		</Text>
	);
}

const renderStatus: TableColumnRender<Tables<"bulk_jobs_info">> = (
	_value,
	rowData
) => {
	return rowData.verified === rowData.number_of_emails ? (
		<>
			Finished <Check />
		</>
	) : (
		<>
			Processing {rowData.verified} / {rowData.number_of_emails}...
		</>
	);
};

const renderSafe = (value: string) => (
	<Text className="text-right" span type="success" width="100%">
		{value}
	</Text>
);
const renderInvalid = (value: string) => (
	<Text className="text-right" span type="error" width="100%">
		{value}
	</Text>
);
const renderRisky = (value: string) => (
	<Text className="text-right" span type="warning" width="100%">
		{value}
	</Text>
);
const renderUnknown = (value: string) => (
	<Text className="text-right" span type="secondary" width="100%">
		{value}
	</Text>
);

const renderDownloadCsv: TableColumnRender<Tables<"bulk_jobs_info">> = (
	_value,
	rowData
) => {
	return (
		<Button auto icon={<Download />}>
			Download CSV
		</Button>
	);
};
