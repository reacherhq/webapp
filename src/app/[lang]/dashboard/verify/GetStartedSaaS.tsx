"use client";

import { Button, Card, Code, Input, Spacer, Text } from "@geist-ui/react";
import { CheckEmailOutput } from "@reacherhq/api/lib";
import React, { useState } from "react";

import { postData } from "@/util/helpers";
import { sentryException } from "@/util/sentry";
import { Dictionary } from "@/dictionaries";
import Markdown from "marked-react";
import { SpanRenderer } from "../../../../components/Markdown";
import { UserDetails } from "@/supabase/supabaseServer";

function alertError(
	email: string,
	e: string,
	d: Dictionary["dashboard"]["get_started_saas"]
) {
	alert(d.unexpected_error.replace("%s1", email).replace("%s2", e));
}

interface DemoProps {
	d: Dictionary;
	userDetails: UserDetails;
	onVerified?(result: CheckEmailOutput): Promise<void>;
}

export function GetStartedSaaS({
	onVerified,
	userDetails,
	...props
}: DemoProps) {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<CheckEmailOutput | undefined>();
	const d = props.d.dashboard.get_started_saas;

	function handleVerify() {
		window.sa_event && window.sa_event("dashboard:verify:click");
		if (!email) {
			return;
		}

		setResult(undefined);

		setLoading(true);
		console.log("[/dashboard] Verifying email", email);
		postData<CheckEmailOutput>({
			url: `/api/v0/check_email`,
			token: userDetails?.api_token,
			data: {
				to_email: email,
			},
		})
			.then((r) => {
				setResult(r);
				setLoading(false);
				return onVerified && onVerified(r);
			})
			.catch((err: Error) => {
				sentryException(err);
				alertError(email, err.message, d);
				setLoading(false);
			});
	}

	return (
		<Card>
			<Text h3>{d.verify_email}</Text>

			<Text>{d.enter_text_results}</Text>

			<div className="text-center">
				<Input
					autoFocus
					disabled={loading}
					onChange={(e) => {
						setEmail(e.target.value);
					}}
					placeholder="test@gmail.com"
					type="success"
					value={email}
				></Input>

				<Spacer />

				<Button
					disabled={loading}
					loading={loading}
					onClick={handleVerify}
					type="success"
				>
					{d.verify_button}
				</Button>
			</div>

			<Spacer />

			{result && (
				<>
					<Text>
						{d.congratulations}{" "}
						<code>
							is_reachable ={" "}
							<strong>{result.is_reachable}</strong>
						</code>
						, {explanation(result, d)}{" "}
						<Markdown renderer={SpanRenderer}>
							{d.full_documentation}
						</Markdown>
					</Text>
					<Code block>{JSON.stringify(result, undefined, "  ")}</Code>
				</>
			)}
		</Card>
	);
}

function explanation(
	result: CheckEmailOutput,
	d: Dictionary["dashboard"]["get_started_saas"]
): string {
	return d[`result_${result.is_reachable}`];
}
