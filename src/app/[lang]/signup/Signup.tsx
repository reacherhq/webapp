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

type EMAIL_VOLUME =
	| "SAAS_10K"
	| "COMMERCIAL_1M"
	| "COMMERCIAL_5M"
	| "COMMERCIAL_10M"
	| "COMMERCIAL_100M"
	| "OTHER";

export default function SignUp(props: { d: Dictionary }): React.ReactElement {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [companyWebsite, setCompanyWebsite] = useState("");
	const [b2bB2c, setB2bB2c] = useState<"B2B" | "B2C" | undefined>();
	const [emailVoume, setEmailVolume] = useState<EMAIL_VOLUME | undefined>();
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
		if (
			email.endsWith("@gmail.com") ||
			email.endsWith("@yahoo.com") ||
			email.endsWith("@hotmail.com") ||
			email.endsWith("@outlook.com")
		) {
			setMessage({
				type: "error",
				content:
					"Personal addresses are currently disabled due to spam abuse. Please use a company email.",
			});
			setLoading(false);
			return;
		}

		const { error } = await supabase.auth.signUp({
			email,
			password,
			options: {
				data: {
					b2bB2c,
					companyWebsite,
					heardFrom: feedback,
					emailVoume,
				},
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
				<Spacer />
				<Text i p small>
					{d.prevent_spam}
				</Text>
				<Input
					placeholder="ex: mycompany.com"
					onChange={(e) => setCompanyWebsite(e.currentTarget.value)}
					required
					type={message?.type}
					width="100%"
				>
					{d.company_website}
				</Input>
				<EmailVolume onChange={setEmailVolume} d={d.email_volume} />
				<B2BB2C onChange={setB2bB2c} d={d.b2b_b2c} />
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

function EmailVolume({
	onChange,
	d,
}: {
	onChange: (f: EMAIL_VOLUME) => void;
	d: Dictionary["signup"]["email_volume"];
}): React.ReactElement {
	const options: { value: EMAIL_VOLUME; label: string }[] = [
		{ value: "SAAS_10K", label: `10K ${d.per_month}` },
		{ value: "COMMERCIAL_1M", label: `1M ${d.per_month}` },
		{ value: "COMMERCIAL_5M", label: `5M ${d.per_month}` },
		{ value: "COMMERCIAL_10M", label: `10M ${d.per_month}` },
		{ value: "COMMERCIAL_100M", label: `100M ${d.per_month}` },
		{ value: "OTHER", label: d.other },
	];

	return (
		<>
			<Text p small>
				{d.title}
			</Text>
			<Select
				placeholder="10K, 5M..."
				onChange={(o) => onChange(o as EMAIL_VOLUME)}
				width="100%"
			>
				{options.map((option) => (
					<Select.Option key={option.value} value={option.value}>
						{option.label}
					</Select.Option>
				))}
			</Select>
		</>
	);
}

function B2BB2C({
	onChange,
	d,
}: {
	onChange: (f: "B2B" | "B2C") => void;
	d: Dictionary["signup"]["b2b_b2c"];
}): React.ReactElement {
	return (
		<>
			<Text p small>
				{d.title}
			</Text>
			<Select
				placeholder="B2B, B2C"
				onChange={(o) => {
					onChange(o as "B2B" | "B2C");
				}}
				width="100%"
			>
				<Select.Option value="B2B">B2B</Select.Option>
				<Select.Option value="B2C">B2C</Select.Option>
			</Select>
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
			<Text p small>
				{d.title}
			</Text>
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
