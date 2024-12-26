"use client";

import { Dictionary } from "@/dictionaries";
import { Button, Card, Snippet, Spacer, Text } from "@/components/Geist";
import Markdown from "marked-react";
import React from "react";
import Link from "next/link";
import { UserDetails } from "@/supabase/supabaseServer";
import { User } from "@supabase/supabase-js";

export function GetStartedCommercial(props: {
	user: User;
	userDetails: UserDetails;
	d: Dictionary;
}) {
	const d = props.d.dashboard.get_started_license;
	const { user, userDetails } = props;

	return (
		<>
			<Card>
				<Text h3>{d.run_docker_title}</Text>
				<Markdown>{d.run_docker_setup_server}</Markdown>
				<Snippet
					symbol=""
					text={`docker run -p 8080:8080 -e RCH__COMMERCIAL_LICENSE_TRIAL__API_TOKEN=${userDetails.api_token} reacherhq/commercial-license-trial:latest`}
					type="lite"
					width="100%"
				/>
				<Markdown>{d.run_docker_api_call}</Markdown>
				<Snippet
					symbol=""
					text={[
						"curl -X POST \\",
						"  -H 'Content-Type: application/json' \\",
						`  -d '{"to_email":"${
							user.email || "amaury@reacher.email"
						}}"}' \\`,
						"  http://localhost:8080/v1/check_email",
					]}
					type="lite"
					width="100%"
				/>
				<Markdown>{d.run_docker_read_more}</Markdown>
				<Markdown>{d.run_docker_features}</Markdown>
				<Markdown>{d.run_docker_contact}</Markdown>
			</Card>
			<Spacer />
			<Card>
				<Text h3>{d.purchase_license_title}</Text>
				<Markdown>{d.purchase_license_explanation}</Markdown>
				<div className="text-center">
					<Link href="/pricing">
						<Button type="success">
							{d.purchase_license_button}
						</Button>
					</Link>
				</div>
			</Card>
		</>
	);
}
