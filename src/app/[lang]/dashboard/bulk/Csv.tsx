"use client";

import React, { useCallback, useState } from "react";
import { Dictionary } from "@/dictionaries";
import { Button, Card, Spacer, Table, Text } from "@geist-ui/react";
import { sentryException } from "@/util/sentry";
import { CheckEmailOutput } from "@reacherhq/api";
import { postData } from "@/util/helpers";
import { useDropzone } from "react-dropzone";
import CheckInCircleFill from "@geist-ui/react-icons/checkInCircleFill";
import Upload from "@geist-ui/react-icons/upload";
import FileText from "@geist-ui/react-icons/fileText";
import XCircleFill from "@geist-ui/react-icons/xCircleFill";

export function Csv({ ...props }: { d: Dictionary }): React.ReactElement {
	const d = props.d.dashboard.get_started_bulk;

	const [emails, setEmails] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [upload, setUpload] = useState(<UploadButton d={d} />);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			setEmails([]);
			if (acceptedFiles.length === 0) {
				return;
			}
			if (acceptedFiles.length > 1) {
				setUpload(
					<Error
						error={d.error.one_file.replace(
							"%s",
							acceptedFiles.length.toString()
						)}
						d={d}
					/>
				);
				return;
			}
			const file = acceptedFiles[0];
			setUpload(<Analyzing d={d} file={file} />);
			const reader = new FileReader();
			reader.onabort = () => {
				setUpload(<Error error={d.error.aborted} d={d} />);
			};
			reader.onerror = () => {
				setUpload(<Error error={d.error.invalid_file} d={d} />);
			};
			reader.onload = () => {
				// Do whatever you want with the file contents
				const binaryStr = reader.result?.toString();
				if (typeof binaryStr !== "string") {
					setUpload(<Error error={d.error.empty} d={d} />);
					return;
				}
				const lines = binaryStr
					.split("\n")
					.map((s) => s.trim())
					.filter((x) => !!x)
					.map((l) => l.split(",")[0]);

				if (!lines.length) {
					setUpload(<Error error={d.error.no_emails} d={d} />);
					return;
				}

				// Optionally remove 1st line with headers.
				if (
					!lines[0].includes("@") ||
					lines[0].toLocaleLowerCase() === "email"
				) {
					lines.shift();
				}

				if (!lines.length) {
					setUpload(<Error error={d.error.no_emails} d={d} />);
					return;
				}

				setEmails(lines);
				setUpload(<Analyzed file={file} emails={lines} d={d} />);
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
		setLoading(true);
		setUpload(<Uploading d={d} />);
		postData<CheckEmailOutput>({
			url: `/api/v1/bulk`,
			data: {
				input_type: "array",
				input: emails,
			},
		})
			.then(() => {
				setUpload(<Uploaded d={d} emailsNum={emails.length} />);
				setEmails([]);
			})
			.catch((err: Error) => {
				sentryException(err);
				setUpload(<Error error={err.message} d={d} />);
			})
			.finally(() => {
				setLoading(false);
			});
	}

	return (
		<Card>
			<Text h3>{d.upload_csv}</Text>

			<Spacer h={3} />
			<Card
				className="m-auto text-center"
				hoverable
				shadow={isDragActive}
				width="400px"
			>
				<Spacer h={2} />
				<Card.Body {...getRootProps()}>
					<input {...getInputProps()} />
					{upload}
				</Card.Body>

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
								? d.button_uploading
								: d.button_upload.replace(
										"%s",
										emails.length.toString()
								  )}
						</Button>
					</div>
				)}
				<Spacer h={2} />
			</Card>
			<Spacer h={3} />
		</Card>
	);
}

function UploadButton({
	d,
}: {
	d: Dictionary["dashboard"]["get_started_bulk"];
}) {
	return (
		<>
			<p>{d.dropzone_text}</p>
			<p>
				<Upload />
			</p>
			<Button>{d.dropzone_button}</Button>
		</>
	);
}

function Analyzing({
	d,
	file,
}: {
	file: File;
	d: Dictionary["dashboard"]["get_started_bulk"];
}) {
	return <h4>{d.step_analzying.replace("%s", file.name)}</h4>;
}

function Analyzed({
	d,
	file,
	emails,
}: {
	file: File;
	emails: string[];
	d: Dictionary["dashboard"]["get_started_bulk"];
}) {
	const rows = emails.map((email) => ({ email })).slice(0, 3);
	if (emails.length > 3) {
		rows.push({
			email: d.step_complete.more_emails.replace(
				"%s",
				(emails.length - 3).toString()
			),
		});
	}

	return (
		<>
			<FileText />
			<h4>{d.step_analyzed.title.replace("%s", file.name)}</h4>
			<Table data={rows}>
				<Table.Column
					label={d.step_analyzed.label.replace(
						"%s",
						emails.length.toString()
					)}
					prop="email"
				/>
			</Table>
		</>
	);
}

function Uploading({ d }: { d: Dictionary["dashboard"]["get_started_bulk"] }) {
	return (
		<>
			<Upload />
			<h4>{d.step_loading.title}</h4>
			<p>{d.step_loading.description}</p>
		</>
	);
}

function Uploaded({
	emailsNum,
	d,
}: {
	emailsNum: number;
	d: Dictionary["dashboard"]["get_started_bulk"];
}) {
	return (
		<>
			<CheckInCircleFill color="green" />
			<h4>{d.step_complete.title}</h4>
			<p>
				{d.step_complete.description.replace(
					"%s",
					emailsNum.toString()
				)}
			</p>
		</>
	);
}

function Error({
	error,
	d,
}: {
	error: string;
	d: Dictionary["dashboard"]["get_started_bulk"];
}) {
	return (
		<>
			<XCircleFill color="red" />
			<h4>{d.error.title}</h4>
			<p>{error}</p>
			<Button>{d.error.try_again}</Button>
		</>
	);
}
