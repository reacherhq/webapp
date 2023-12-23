import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";
import { Button, Card, Spacer, Table, Text } from "@geist-ui/react";
import { supabase } from "@/util/supabaseClient";
import { Tables } from "@/supabase/database.types";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";
import { CheckEmailOutput } from "@reacherhq/api";
import { postData } from "@/util/helpers";
import { useDropzone } from "react-dropzone";
import CheckInCircleFill from "@geist-ui/react-icons/checkInCircleFill";
import Upload from "@geist-ui/react-icons/upload";
import FileText from "@geist-ui/react-icons/fileText";

export function alertError(
	e: string,
	d: ReturnType<typeof dictionary>["dashboard"]["get_started_saas"]
) {
	alert(d.unexpected_error.replace("%s2", e));
}

export function GetStartedBulk(): React.ReactElement {
	const { user, userDetails } = useUser();
	const [emails, setEmails] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [bulkJobs, setBulkJobs] = useState<Tables<"bulk_jobs_info">[]>([]);
	const [upload, setUpload] = useState(<UploadButton />);
	const router = useRouter();
	const d = dictionary(router.locale).dashboard;

	useEffect(() => {
		// This is a temporary redirect to the dashboard while I still work
		// on the bulk page.
		if (window.location.hostname == "app.reacher.email") {
			window.location.href = "https://app.reacher.email/dashboard/verify";
		}
	}, []);

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

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			setEmails([]);
			if (acceptedFiles.length === 0) {
				return;
			}
			if (acceptedFiles.length > 1) {
				alertError(
					`You can only upload one file at a time. You uploaded ${acceptedFiles.length}`,
					d.get_started_saas
				);
				return;
			}
			const file = acceptedFiles[0];
			setUpload(<Analyzing file={file} />);
			const reader = new FileReader();
			reader.onabort = () => {
				alertError(
					`File reading was aborted for ${file.name}`,
					d.get_started_saas
				);
			};
			reader.onerror = () => {
				alertError(
					`File reading has failed for ${file.name}`,
					d.get_started_saas
				);
			};
			reader.onload = () => {
				// Do whatever you want with the file contents
				const binaryStr = reader.result;
				if (typeof binaryStr !== "string") {
					alertError(
						`binaryStr is not a string for ${file.name}`,
						d.get_started_saas
					);
					return;
				}
				const lines = binaryStr.split("\n").map((l) => l.split(",")[0]);
				// Optionally remove 1st line with headers.
				if (
					!lines[0].includes("@") ||
					lines[0].toLocaleLowerCase() === "email"
				) {
					lines.shift();
				}

				if (!lines.length) {
					alertError(
						`No emails found in ${file.name}`,
						d.get_started_saas
					);
					return;
				}

				setEmails(lines);
				setUpload(<Analyzed file={file} emails={lines} />);
			};

			reader.readAsText(file);
		},
		[d]
	);
	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		accept: {
			"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
				[".csv", ".xlsx", ".xls"],
			"application/vnd.ms-excel": [".csv", ".xlsx", ".xls"],
			"text/csv": [".csv"],
		},
		onDrop,
	});

	function handleVerify() {
		if (!emails) {
			return;
		}
		if (!userDetails) {
			alertError(
				`userDetails is undefined for user ${user?.id || "undefined"}`,
				d.get_started_saas
			);
			return;
		}
		setLoading(true);
		postData<CheckEmailOutput>({
			url: `/api/v1/bulk`,
			token: userDetails?.api_token,
			data: {
				input_type: "array",
				input: emails,
			},
		})
			.then(() => {
				setUpload(<Uploaded emailsNum={emails.length} />);
			})
			.catch((err: Error) => {
				sentryException(err);
				alertError(err.message, d.get_started_saas);
			})
			.finally(() => {
				setEmails([]);
				setLoading(false);
			});
	}

	return (
		<Card>
			<Text h3>Upload a CSV file</Text>

			<Card
				className="m-auto text-center"
				hoverable={isDragActive}
				shadow={isDragActive}
				width="400px"
			>
				<div {...getRootProps()}>
					<input {...getInputProps()} />
					{upload}
				</div>
				{!!emails.length && (
					<div className="text-center">
						<Spacer />
						<Button
							auto
							className="m-auto"
							disabled={loading}
							loading={loading}
							onClick={handleVerify}
							type="success"
							icon={!loading && <Upload />}
						>
							{loading
								? "Uploading..."
								: `Bulk Verify ${emails.length} emails`}
						</Button>
					</div>
				)}
			</Card>

			<Spacer y={3} />
			<Text h3>My Bulk Jobs</Text>
			<Table data={bulkJobs}>
				<Table.Column prop="bulk_job_id" label="job_id" />
				<Table.Column prop="verified" label="Verified" />
				<Table.Column prop="number_of_emails" label="Total emails" />
				<Table.Column prop="created_at" label="Created At" />
				<Table.Column prop="last_call_time" label="Finished At" />
				<Table.Column prop="safe" label="Safe" />
				<Table.Column prop="invalid" label="Invalid" />
				<Table.Column prop="risky" label="Risky" />
				<Table.Column prop="unknown" label="Unknown" />
			</Table>
		</Card>
	);
}

function UploadButton() {
	return (
		<>
			<p>Drag'n'drop some files here</p>
			<p>
				<Upload />
			</p>
			<Button>Or click to select Files</Button>
		</>
	);
}

function Analyzing({ file }: { file: File }) {
	return <h4>Analyzing {file.name}</h4>;
}

function Analyzed({ file, emails }: { file: File; emails: string[] }) {
	const rows = emails.map((email) => ({ email })).slice(0, 3);
	if (emails.length > 3) {
		rows.push({ email: `+${emails.length - 3} more...` });
	}

	return (
		<>
			<FileText />
			<h4>Analyzed {file.name}</h4>
			<Table data={rows}>
				<Table.Column
					label={`Found ${emails.length} emails`}
					prop="email"
				/>
			</Table>
		</>
	);
}

function Uploaded({ emailsNum }: { emailsNum: number }) {
	return (
		<>
			<CheckInCircleFill color="green" />
			<h4>Congratulations!</h4>
			<p>
				Your {emailsNum} emails are currently being verified. You'll get
				notified by email once the job is done. You can also check the
				progress in the table below.
			</p>
		</>
	);
}
