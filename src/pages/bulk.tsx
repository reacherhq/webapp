import { Button, Page, Spacer, Text, Textarea } from "@geist-ui/react";
import { CheckEmailOutput } from "@reacherhq/api/lib";
import React, { useEffect, useState } from "react";

import { postData } from "@/util/helpers";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";
import { Tables } from "@/supabase/database.types";
import { supabase } from "@/util/supabaseClient";
import { Nav } from "@/components";

function alertError(email: string, e: string) {
	alert(
		`An unexpected error happened. Can you email amaury@reacher.email with this message (or a screenshot)?
		
Email: ${email}
Error: ${e}`
	);
}

interface BulkProps {
	onVerified?(result: CheckEmailOutput): Promise<void>;
}

interface BulkJobWithEmails extends Tables<"bulk_jobs"> {
	bulk_emails: Tables<"bulk_emails">[];
}

export default function Bulk({ onVerified }: BulkProps): React.ReactElement {
	const { user, userDetails } = useUser();
	const [emails, setEmails] = useState("");
	const [loading, setLoading] = useState(false);

	const [bulkJobs, setBulkJobs] = useState<BulkJobWithEmails[]>([]);

	useEffect(() => {
		// This is a temporary redirect to the dashboard while I still work
		// on the bulk page.
		if (window.location.hostname == "app.reacher.email") {
			window.location.href = "https://app.reacher.email/dashboard";
		}
	}, []);

	useEffect(() => {
		setInterval(async () => {
			console.log("FETCHING BULK JOBS...");
			const res = await supabase
				.from<BulkJobWithEmails>("bulk_jobs")
				.select(`*,bulk_emails(*)`)
				.order("created_at", { ascending: false });
			if (res.error) {
				sentryException(res.error);
				return;
			}

			setBulkJobs(res.data);
		}, 3000);
	}, []);

	function handleVerify() {
		if (!emails) {
			return;
		}

		if (!userDetails) {
			alertError(
				"n/a",
				`userDetails is undefined for user ${user?.id || "undefined"}`
			);
			return;
		}

		setLoading(true);
		console.log("[/dashboard] Verifying email", emails);
		postData<CheckEmailOutput>({
			url: `/api/v1/bulk`,
			token: userDetails?.api_token,
			data: {
				input_type: "array",
				input: emails.split("\n"),
			},
		})
			.then((r) => {
				setLoading(false);
				return onVerified && onVerified(r);
			})
			.catch((err: Error) => {
				sentryException(err);
				alertError(emails, err.message);
				setLoading(false);
			});
	}

	return (
		<>
			<Nav />
			<Page>
				<Text h3>BULK Work in Progress Page</Text>

				<div className="text-center">
					<Textarea
						autoFocus
						disabled={loading}
						onChange={(e) => {
							setEmails(e.target.value);
						}}
						placeholder="test@gmail.com"
						value={emails}
					></Textarea>

					<Spacer />

					<Button
						disabled={loading}
						loading={loading}
						onClick={handleVerify}
						type="success"
					>
						Bulk Verify
					</Button>
				</div>

				<Spacer />

				<div>
					ALLJOBS:
					{bulkJobs.map((job) => (
						<div key={job.id}>
							{job.id} -{" "}
							{
								job.bulk_emails.filter(
									({ call_id }) => !!call_id
								).length
							}
							/{job.bulk_emails.length}
						</div>
					))}
				</div>
			</Page>
		</>
	);
}
