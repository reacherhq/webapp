"use client";

import { Dictionary } from "@/dictionaries";
import { Button, Card, Text } from "@/components/Geist";
import Markdown from "marked-react";
import React from "react";
import Link from "next/link";
import { UserDetails } from "@/supabase/supabaseServer";
import { User } from "@supabase/supabase-js";
import { Download } from "@geist-ui/react-icons";

export function GetStartedPaid(props: {
	user: User;
	userDetails: UserDetails;
	d: Dictionary;
}) {
	const d = props.d.dashboard.get_started_license;

	return (
		<>
			<Card>
				<Text h3>{d.thank_you_for_purchase_title}</Text>
				<Button
					onClick={() =>
						alert(
							"This button has a small bug at the moment. Send me an email at amaury@reacher.email to get your license."
						)
					}
					type="success"
					icon={<Download />}
				>
					{d.download_license}
				</Button>
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
