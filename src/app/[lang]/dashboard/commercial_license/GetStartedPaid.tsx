"use client";

import { Dictionary } from "@/dictionaries";
import { Button, Card, Text } from "@/components/Geist";
import Markdown from "marked-react";
import React from "react";
import Link from "next/link";
import { UserDetails } from "@/supabase/supabaseServer";
import { User } from "@supabase/supabase-js";
import { Tables } from "@/supabase/database.types";
import { Download } from "@geist-ui/react-icons";
import { formatDate } from "@/util/helpers";

export function GetStartedPaid(props: {
	lang: string;
	user: User;
	userDetails: UserDetails;
	d: Dictionary;
	subAndCalls: Tables<"sub_and_calls">;
}) {
	const d = props.d.dashboard.get_started_license;

	return (
		<>
			<Card>
				<Text h3>{d.thank_you_for_purchase_title}</Text>
				<div className="text-center">
					<Link href="/api/v1/commercial_license">
						<Button type="success">
							<Download />
							{props.subAndCalls.current_period_start &&
							props.subAndCalls.current_period_end
								? d.download_license
										.replace(
											"%s",
											formatDate(
												props.subAndCalls
													.current_period_start,
												props.lang
											)
										)
										.replace(
											"%s",
											formatDate(
												props.subAndCalls
													.current_period_end,
												props.lang
											)
										)
								: d.download_license
										.replace("%s", "")
										.replace("%s", "")}
						</Button>
					</Link>
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
