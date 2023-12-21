import { Input, Select, Spacer, Text } from "@geist-ui/react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import {
	SigninButton,
	SigninLayout,
	SigninLayoutMessage,
	SigninMessage,
} from "../components/SigninLayout";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";
import { dictionary } from "@/dictionaries";
import Link from "next/link";

export default function SignUp(): React.ReactElement {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<SigninMessage | undefined>(
		undefined
	);
	const [feedback, setFeedback] = useState<string | undefined>();
	const [passedCatpcha, setPassedCatpcha] = useState(false);

	const router = useRouter();
	const { user, signUp } = useUser();
	const d = dictionary(router.locale).signup;

	const handleSignup = async () => {
		setLoading(true);
		setMessage(undefined);
		const { error } = await signUp(
			{
				email,
				password,
			},
			feedback ? { heardFrom: feedback } : undefined
		);
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

	useEffect(() => {
		if (user) {
			router.replace("/dashboard").catch(sentryException);
		}
	}, [router, user]);

	return (
		<SigninLayout title={d.title}>
			<Input
				type="email"
				placeholder="Email"
				onChange={(e) => setEmail(e.currentTarget.value)}
				required
				size="large"
				status={message?.type}
				width="100%"
			>
				{d.email}
			</Input>
			<Spacer />
			<Input.Password
				type="password"
				placeholder={d.password}
				onChange={(e) => setPassword(e.currentTarget.value)}
				required
				size="large"
				status={message?.type}
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
				{d.already_have_account} <Link href="/login">{d.login}</Link>
			</Text>
		</SigninLayout>
	);
}

function Feedback({
	onChange,
	d,
}: {
	onChange: (f: string) => void;
	d: ReturnType<typeof dictionary>["signup"]["feedback"];
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
				size="medium"
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
