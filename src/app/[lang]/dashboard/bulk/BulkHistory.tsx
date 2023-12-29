"use client";

import React, { useEffect, useState } from "react";
import { Dictionary } from "@/dictionaries";
import { Button, Card, Spacer, Table, Text } from "@geist-ui/react";
import { Tables } from "@/supabase/database.types";
import { formatDate } from "@/util/helpers";
import { Download } from "@geist-ui/react-icons";
import { TableColumnRender } from "@geist-ui/react/esm/table";
import Check from "@geist-ui/react-icons/check";
import { createClient } from "@/supabase/client";
import { sentryException } from "@/util/sentry";

export function BulkHistory(props: {
	initialBulksJobs: Tables<"bulk_jobs_info">[];
	d: Dictionary;
}) {
	const supabase = createClient();
	const d = props.d.dashboard.get_started_bulk.history;
	const [bulkJobs, setBulkJobs] = useState(props.initialBulksJobs);

	useEffect(() => {
		setInterval(async () => {
			const res = await supabase.from("bulk_jobs_info").select("*");
			if (res.error) {
				sentryException(res.error);
				return;
			}

			setBulkJobs(res.data);
		}, 3000);
	}, [supabase]);

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

	const renderDownloadCsv: TableColumnRender<Tables<"bulk_jobs_info">> = (
		_value,
		rowData
	) => {
		return (
			<div className="m-auto">
				{rowData.verified === rowData.number_of_emails ? (
					<a
						href={`/api/v1/bulk/${rowData.bulk_job_id}/download`}
						download={`bulkjob_${rowData.bulk_job_id}_results.csv`}
					>
						<Button className="m-auto" auto icon={<Download />}>
							{d.button_download}
						</Button>
					</a>
				) : (
					<em>{d.table.not_available}</em>
				)}
			</div>
		);
	};

	return (
		<Card>
			<Text h3>{bulkJobs === undefined ? d.title_loading : d.title}</Text>
			<Spacer />
			<Table data={bulkJobs || []}>
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
						<>{formatDate(value as string, props.d.lang)}</>
					)}
				/>
				<Table.Column
					className="text-right"
					prop="safe"
					render={renderSafe}
				>
					<Text className="full-width text-right green" span>
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
	<Text className="full-width text-right green" span>
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
