"use client";

import { Input, Select, Spacer, Text } from "@geist-ui/react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import React, { useState } from "react";

import {
	SigninButton,
	SigninLayout,
	SigninLayoutMessage,
	SigninMessage,
} from "@/components/SigninLayout";
import { sentryException } from "@/util/sentry";
import { Dictionary } from "@/dictionaries";
import { createClient } from "@/supabase/client";
import { DLink } from "@/components/DLink";
import { getWebappURL } from "@/util/helpers";

export default function SignUp(props: { d: Dictionary }): React.ReactElement {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<SigninMessage | undefined>(
		undefined
	);
	const [feedback, setFeedback] = useState<string | undefined>();
	const [passedCatpcha, setPassedCatpcha] = useState(false);

	const supabase = createClient();
	const d = props.d.signup;

	const handleSignup = async () => {
		setLoading(true);
		setMessage(undefined);
		if (email.endsWith("@gmail.com")) {
			setMessage({
				type: "error",
				content:
					"Gmail addresses are currently disabled due to spam abuse. Please use a company email.",
			});
			setLoading(false);
			return;
		}

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: feedback ? { heardFrom: feedback } : undefined,
				emailRedirectTo: `${getWebappURL()}/auth/callback`,
			},
		});
		if (error) {
			setMessage({ type: "error", content: error?.message });
		} else {
			setMessage({
				type: "success",
				content: d.success_check_email,
			});
		}
		setLoading(false);
	};

	return (
		<>
			<Spacer h={5} />
			<SigninLayout title={d.title}>
				<Input
					placeholder="Email"
					onChange={(e) => setEmail(e.currentTarget.value)}
					required
					type={message?.type}
					width="100%"
				>
					{d.email}
				</Input>
				<Spacer />
				<Input.Password
					placeholder={d.password}
					onChange={(e) => setPassword(e.currentTarget.value)}
					required
					type={message?.type}
					width="100%"
				>
					{d.password}
				</Input.Password>
				<Feedback onChange={setFeedback} d={d.feedback} />
				{message && <SigninLayoutMessage message={message} />}

				<Spacer />

				<div className="text-center">
					<HCaptcha
						sitekey="e8cdd278-b060-4c52-9625-7719ee025d5a" // Public site key
						onVerify={() => setPassedCatpcha(true)}
					/>
				</div>

				<Spacer />

				<SigninButton
					disabled={loading || !passedCatpcha}
					loading={loading}
					onClick={() => {
						handleSignup().catch(sentryException);
					}}
				>
					{loading ? d.button_signing_up : d.button_sign_up}
				</SigninButton>

				<Text p className="text-center">
					{d.already_have_account}{" "}
					<DLink d={props.d} href="/login">
						{d.login}
					</DLink>
				</Text>
			</SigninLayout>
			<Spacer h={5} />
		</>
	);
}

function Feedback({
	onChange,
	d,
}: {
	onChange: (f: string) => void;
	d: Dictionary["signup"]["feedback"];
}): React.ReactElement {
	const [option, setOption] = useState<string | undefined>();

	return (
		<>
			<Text>{d.title}</Text>
			<Select
				placeholder={d.placeholder}
				onChange={(o) => {
					setOption(o as string);
					onChange(o as string);
				}}
				width="100%"
			>
				<Select.Option value="google">Google Search</Select.Option>
				<Select.Option value="github">Github</Select.Option>
				<Select.Option value="blog-geekflare">Geekflare</Select.Option>
				<Select.Option value="blog-du-modérateur">
					Blog du Modérateur
				</Select.Option>
				<Select.Option value="other">{d.other}</Select.Option>
			</Select>

			{option === "google" && (
				<>
					<Spacer />
					<Input
						placeholder={d.google_search_placeholder}
						onChange={(e) => {
							const s = e.currentTarget.value;
							onChange(`${option}:${s}`);
						}}
						width="100%"
					>
						{d.google_search_terms}
					</Input>
				</>
			)}
			{option === "other" && (
				<>
					<Spacer />
					<Input
						placeholder={d.other_placeholder}
						onChange={(e) => {
							const s = e.currentTarget.value;
							onChange(`${option}:${s}`);
						}}
						width="100%"
					>
						{d.other_share_details}
					</Input>
				</>
			)}
		</>
	);
}
