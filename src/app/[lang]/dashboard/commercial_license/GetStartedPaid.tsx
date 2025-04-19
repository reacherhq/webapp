"use client";

import { Dictionary } from "@/dictionaries";
import { Button, Card, Text } from "@/components/Geist";
import Markdown from "marked-react";
import React from "react";
import Link from "next/link";
import { UserDetails } from "@/supabase/supabaseServer";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/supabase/database.types";
import { formatDate } from "@/util/helpers";
import { DownloadPdf } from "@/components/DownloadPdf";
import { Download } from "@geist-ui/react-icons";
import { generateMarkdown, LicenseMetadata } from "./license";

export async function GetStartedPaid(props: {
	lang: string;
	user: User;
	userDetails: UserDetails;
	d: Dictionary;
	subAndCalls: Tables<"sub_and_calls">;
	licenseMetadata: LicenseMetadata;
}) {
	const d = props.d.dashboard.get_started_license;
	const licenseContent = await generateMarkdown(props.licenseMetadata);
	const startDate = props.licenseMetadata.stripe_buy_date;
	const endDate = props.licenseMetadata.license_end_date;

	const buttonText = d.download_license
		.replace("%s", formatDate(startDate, props.lang))
		.replace("%s", formatDate(endDate, props.lang));

	return (
		<>
			<Card>
				<Text h3>{d.thank_you_for_purchase_title}</Text>
				<div className="text-center">
					<DownloadPdf
						markdownContent={licenseContent}
						fileName={`reacher-commercial-license-${
							startDate.toISOString().split("T")[0]
						}.pdf`}
						buttonText={buttonText}
						buttonIcon={<Download />}
					/>
				</div>
				<Markdown>{d.thank_you_for_purchase_explanation}</Markdown>

				<div className="text-center">
					<Link
						href="https://meet.brevo.com/amaury"
						target="_blank"
						rel="noreferrer"
					>
						<Button type="success">{d.book_call_cta}</Button>
					</Link>
				</div>
			</Card>
		</>
	);
}
