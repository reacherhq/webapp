import { Card, Snippet, Spacer, Text } from "@geist-ui/react";
import React from "react";

import { useUser } from "@/util/useUser";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";
import Markdown from "marked-react";

export function GetStartedApi(): React.ReactElement {
	const { userDetails } = useUser();
	const router = useRouter();
	const d = dictionary(router.locale).dashboard.get_started_api;

	return (
		<Card>
			<Text h4>{d.title}</Text>
			<Spacer />

			<Text>{d.reacher_powerful_api}</Text>

			{userDetails?.api_token ? (
				<>
					<Text p>{d.http_post}</Text>
					<Snippet
						symbol=""
						text="https://api.reacher.email/v0/check_email"
						type="lite"
						width="100%"
					/>
					<Text p>{d.with_header}</Text>
					<Snippet
						symbol=""
						text="Authorization: {AUTH_TOKEN}"
						type="lite"
						width="100%"
					/>
					<Markdown>{d.unique_auth_token}</Markdown>
					<Snippet
						symbol=""
						text={userDetails.api_token}
						type="lite"
						width="100%"
					/>
					<Markdown>{d.curl_example}</Markdown>
					<Snippet
						symbol=""
						text={[
							"curl -X POST \\",
							"  https://api.reacher.email/v0/check_email \\",
							"  -H 'content-type: application/json' \\",
							`  -H 'authorization: ${userDetails.api_token}' \\`,
							`  -d '{"to_email": "test@gmail.com"}'`,
						]}
						type="lite"
						width="100%"
					/>
					<Markdown>{d.explain_fields}</Markdown>
				</>
			) : (
				<Text p>
					Error: userDetails token is empty. Please contact
					amaury@reacher.email if you see this error.
				</Text>
			)}

			<Spacer />
			<Text h4>{d.help_no_understand}</Text>
			<Markdown>{d.dont_worry}</Markdown>
		</Card>
	);
}
