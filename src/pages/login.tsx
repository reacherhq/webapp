import { Input, Link as GLink, Spacer, Text } from "@geist-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import {
	SigninButton,
	SigninLayout,
	SigninLayoutMessage,
	SigninMessage,
} from "../components";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";

export default function Login(): React.ReactElement {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<SigninMessage | undefined>(
		undefined
	);
	const router = useRouter();
	const { user, signIn } = useUser();

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
				content: "Check your email for the magic link.",
			});
		} else {
			setMessage({
				type: "success",
				content: "Success, redirecting to your dashboard.",
			});
		}
	};

	useEffect(() => {
		if (user) {
			router.replace("/dashboard").catch(sentryException);
		}
	}, [router, user]);

	return (
		<SigninLayout title="Log In">
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
				Email
			</Input>
			<Spacer />

			<Input.Password
				className="full-width"
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.currentTarget.value)}
				required
				size="large"
				status={message?.type}
				width="100%"
			>
				Password
			</Input.Password>

			{message && <SigninLayoutMessage message={message} />}

			<Text className="text-right mt-0" small p type="secondary">
				<GLink underline href="/reset_password_part_one">
					Forgot password?
				</GLink>
			</Text>

			<Spacer />

			<SigninButton
				disabled={loading}
				loading={loading}
				onClick={() => {
					handleSignin().catch(sentryException);
				}}
			>
				{loading ? "Signing in..." : "Sign in"}
			</SigninButton>

			<Text p className="text-center">
				Don&apos;t have an account?{" "}
				<GLink color href="/signup" underline>
					Sign up
				</GLink>
				.
			</Text>

			<Text p className="text-center">
				Have an account on the old Reacher login page? Head{" "}
				<GLink color href="https://old.reacher.email/login" underline>
					there
				</GLink>
				.
			</Text>
		</SigninLayout>
	);
}
