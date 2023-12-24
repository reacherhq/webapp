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
	const d = dictionary(router.locale).dashboard.get_started_bulk.history;

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

	const renderStatus: TableColumnRender<Tables<"bulk_jobs_info">> = (
		_value,
		rowData
	) => {
		return rowData.verified === rowData.number_of_emails ? (
			<>
				{d.status.finished} <Check />
			</>
		) : (
			<>
				{d.status.processing.replace(
					"%s",
					`${rowData.verified} / ${rowData.number_of_emails}`
				)}
			</>
		);
	};

	const renderDownloadCsv: TableColumnRender<
		Tables<"bulk_jobs_info">
	> = () => {
		return (
			<Button className="m-auto" auto icon={<Download />}>
				{d.button_download}
			</Button>
		);
	};

	return (
		<Card>
			<Text h3>{d.title}</Text>
			<Spacer />
			<Table data={bulkJobs}>
				<Table.Column prop="bulk_job_id" label={d.table.job_id} />
				<Table.Column
					prop="verified"
					label={d.table.status}
					render={renderStatus}
				/>
				<Table.Column
					prop="number_of_emails"
					label={d.table.total_emails}
				/>
				<Table.Column
					prop="created_at"
					label={d.table.uploaded_at}
					render={(value) => (
						<>{formatDate(value as string, router.locale)}</>
					)}
				/>
				<Table.Column
					className="text-right"
					prop="safe"
					render={renderSafe}
				>
					<Text className="full-width text-right" span type="success">
						{d.table.safe}
					</Text>
				</Table.Column>
				<Table.Column
					className="text-right"
					prop="invalid"
					label="Invalid"
					render={renderInvalid}
				>
					<Text className="full-width text-right" span type="error">
						{d.table.invalid}
					</Text>
				</Table.Column>
				<Table.Column
					className="text-right"
					prop="risky"
					label="Risky"
					render={renderRisky}
				>
					<Text className="full-width text-right" span type="warning">
						{d.table.risky}
					</Text>
				</Table.Column>
				<Table.Column
					className="text-right"
					prop="unknown"
					label="Unknown"
					render={renderUnknown}
				>
					<Text
						className="full-width text-right"
						span
						type="secondary"
					>
						{d.table.unknown}
					</Text>
				</Table.Column>
				<Table.Column
					className="text-right"
					prop="user_id"
					label="Full Results"
					render={renderDownloadCsv}
				>
					<Text className="full-width text-center" span>
						{d.table.full_results}
					</Text>
				</Table.Column>
			</Table>
		</Card>
	);
}

const renderSafe = (value: string) => (
	<Text className="full-width text-right" span type="success">
		{value}
	</Text>
);
const renderInvalid = (value: string) => (
	<Text className="full-width text-right" span type="error">
		{value}
	</Text>
);
const renderRisky = (value: string) => (
	<Text className="full-width text-right" span type="warning">
		{value}
	</Text>
);
const renderUnknown = (value: string) => (
	<Text className="full-width text-right" span type="secondary">
		{value}
	</Text>
);
