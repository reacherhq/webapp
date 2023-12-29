"use client";

import { Button, Card, Code, Input, Spacer, Text } from "@geist-ui/react";
import { CheckEmailOutput } from "@reacherhq/api/lib";
import React, { useState } from "react";

import { postData } from "@/util/helpers";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";
import { dictionary, getLocale } from "@/dictionaries";
import Markdown from "marked-react";
import { LinkRenderer, SpanRenderer } from "../../../../components/Markdown";
import { usePathname } from "next/navigation";

function alertError(
	email: string,
	e: string,
	d: ReturnType<typeof dictionary>["dashboard"]["get_started_saas"]
) {
	alert(d.unexpected_error.replace("%s1", email).replace("%s2", e));
}

interface DemoProps {
	onVerified?(result: CheckEmailOutput): Promise<void>;
}

export function GetStartedSaaS({ onVerified }: DemoProps): React.ReactElement {
	const { user, userDetails } = useUser();
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<CheckEmailOutput | undefined>();
	const pathname = usePathname();
	const lang = getLocale(pathname);
	const d = dictionary(lang).dashboard.get_started_saas;

	function handleVerify() {
		window.sa_event && window.sa_event("dashboard:verify:click");
		if (!email) {
			return;
		}

		setResult(undefined);

		if (!userDetails) {
			alertError(
				"n/a",
				`userDetails is undefined for user ${user?.id || "undefined"}`,
				d
			);
			return;
		}

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
					<Spacer />
					<Markdown renderer={LinkRenderer}>{d.see_api}</Markdown>
				</>
			)}
		</Card>
	);
}

function explanation(
	result: CheckEmailOutput,
	d: ReturnType<typeof dictionary>["dashboard"]["get_started_saas"]
): string {
	return d[`result_${result.is_reachable}`];
}
