import { Input, Spacer, Text } from "@geist-ui/react";
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

export default function Login(): React.ReactElement {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<SigninMessage | undefined>(
		undefined
	);
	const router = useRouter();
	const { user, signIn } = useUser();
	const d = dictionary(router.locale).login;

	const handleSignin = async () => {
		setLoading(true);
		setMessage(undefined);

		const { error } = await signIn({ email, password });
		setLoading(false);
		if (error) {
			setMessage({ type: "error", content: error.message });
		} else if (!password) {
			setMessage({
				type: "success",
				content: d.success_magic_link,
			});
		} else {
			setMessage({
				type: "success",
				content: d.success_redirecting,
			});
		}
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
				placeholder="ex. john.doe@gmail.com"
				value={email}
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
				className="full-width"
				type="password"
				placeholder={d.password}
				value={password}
				onChange={(e) => setPassword(e.currentTarget.value)}
				required
				size="large"
				status={message?.type}
				width="100%"
			>
				{d.password}
			</Input.Password>

			{message && <SigninLayoutMessage message={message} />}

			<Text className="text-right mt-0" small p type="secondary">
				<Link href="/reset_password_part_one">{d.forgot_password}</Link>
			</Text>

			<Spacer />

			<SigninButton
				disabled={loading}
				loading={loading}
				onClick={() => {
					handleSignin().catch(sentryException);
				}}
			>
				{loading ? d.button_signing_in : d.button_sign_in}
			</SigninButton>

			<Text p className="text-center">
				{d.dont_have_account} <Link href="/signup">{d.signup}</Link>.
			</Text>
		</SigninLayout>
	);
}
