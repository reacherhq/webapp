import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";
import { Button, Card, Spacer, Table, Text } from "@geist-ui/react";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";
import { CheckEmailOutput } from "@reacherhq/api";
import { postData } from "@/util/helpers";
import { useDropzone } from "react-dropzone";
import CheckInCircleFill from "@geist-ui/react-icons/checkInCircleFill";
import Upload from "@geist-ui/react-icons/upload";
import FileText from "@geist-ui/react-icons/fileText";
import { BulkHistory } from "./BulkHistory";

export function alertError(
	e: string,
	d: ReturnType<typeof dictionary>["dashboard"]["get_started_bulk"]
) {
	alert(d.error.unexpected.replace("%s", e));
}

export function GetStartedBulk(): React.ReactElement {
	const { user, userDetails } = useUser();
	const router = useRouter();
	const d = dictionary(router.locale).dashboard.get_started_bulk;

	const [emails, setEmails] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);
	const [upload, setUpload] = useState(<UploadButton d={d} />);

	useEffect(() => {
		// This is a temporary redirect to the dashboard while I still work
		// on the bulk page.
		if (window.location.hostname == "app.reacher.email") {
			window.location.href = "https://app.reacher.email/dashboard/verify";
		}
	}, []);

	const onDrop = useCallback(
		(acceptedFiles: File[]) => {
			setEmails([]);
			if (acceptedFiles.length === 0) {
				return;
			}
			if (acceptedFiles.length > 1) {
				alertError(
					d.error.one_file.replace(
						"%s",
						acceptedFiles.length.toString()
					),
					d
				);
				return;
			}
			const file = acceptedFiles[0];
			setUpload(<Analyzing d={d} file={file} />);
			const reader = new FileReader();
			reader.onabort = () => {
				alertError(d.error.aborted, d);
			};
			reader.onerror = () => {
				alertError(d.error.invalid_file, d);
			};
			reader.onload = () => {
				// Do whatever you want with the file contents
				const binaryStr = reader.result?.toString();
				if (typeof binaryStr !== "string") {
					alertError(d.error.empty, d);
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
					alertError(d.error.no_emails, d);
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
		if (!userDetails) {
			alertError(
				`userDetails is undefined for user ${user?.id || "undefined"}`,
				d
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
				setUpload(<Uploaded d={d} emailsNum={emails.length} />);
			})
			.catch((err: Error) => {
				sentryException(err);
				alertError(err.message, d);
			})
			.finally(() => {
				setEmails([]);
				setLoading(false);
			});
	}

	return (
		<>
			<Card>
				<Text h3>{d.upload_csv}</Text>

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
									? d.button_uploading
									: d.button_upload.replace(
											"%s",
											emails.length.toString()
									  )}
							</Button>
						</div>
					)}
				</Card>
			</Card>

			<Spacer />

			<BulkHistory />
		</>
	);
}

function UploadButton({
	d,
}: {
	d: ReturnType<typeof dictionary>["dashboard"]["get_started_bulk"];
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
	d: ReturnType<typeof dictionary>["dashboard"]["get_started_bulk"];
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
	d: ReturnType<typeof dictionary>["dashboard"]["get_started_bulk"];
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

function Uploaded({
	emailsNum,
	d,
}: {
	emailsNum: number;
	d: ReturnType<typeof dictionary>["dashboard"]["get_started_bulk"];
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
