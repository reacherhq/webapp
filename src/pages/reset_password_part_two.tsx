import { Input, Note, Spacer } from "@geist-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import {
	SigninButton,
	SigninLayout,
	SigninLayoutMessage,
	SigninMessage,
} from "../components";
import { parseHashComponents } from "../util/helpers";
import { sentryException } from "../util/sentry";
import { supabase } from "../util/supabaseClient";
import { useUser } from "../util/useUser";

export default function ResetPasswordPartTwo(): React.ReactElement {
	const router = useRouter();
	const [accessToken, setAccessToken] = useState("");
	const [password, setPassword] = useState("");
	const [repeat, setRepeat] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<SigninMessage | undefined>(
		undefined
	);
	const [isInvite, setIsInvite] = useState(false); // Landed on this page on first visit, via Invite Link.

	const { user } = useUser();

	useEffect(() => {
		// Password recovery.
		// https://supabase.io/docs/reference/javascript/reset-password-email#notes
		if (typeof window !== "undefined" && window.location.hash) {
			const hashComponents = parseHashComponents(window.location.hash);
			if (
				!hashComponents.access_token ||
				(hashComponents.type !== "invite" &&
					hashComponents.type !== "recovery")
			) {
				router.replace("/dashboard").catch(sentryException);
				return;
			}

			setIsInvite(hashComponents.type === "invite");
			setAccessToken(hashComponents.access_token);
		}
	}, [router]);

	const handleReset = async () => {
		if (password !== repeat) {
			setMessage({
				type: "error",
				content: "The two passwords must match.",
			});
			return;
		}

		setLoading(true);
		setMessage(undefined);

		const { error } = await supabase.auth.api.updateUser(accessToken, {
			password,
		});
		setLoading(false);
		if (error) {
			setMessage({ type: "error", content: error?.message });
		} else {
			setMessage({
				type: "success",
				content: "Password updated successfully.",
			});
			router.push("/dashboard").catch(sentryException);
		}
	};

	return (
		<SigninLayout title="Reset Password">
			{isInvite && (
				<>
					<Spacer />
					<Note label={false} type="success">
						You have been invited to the new Reacher Dashboard via
						an invite link
						{user?.email && (
							<span>
								{" "}
								to <strong>{user.email}</strong>
							</span>
						)}
						. Please set a password below for future logins.
					</Note>
					<Spacer />
				</>
			)}
			<Input.Password
				type="password"
				placeholder="Password"
				onChange={(e) => setPassword(e.currentTarget.value)}
				required
				size="large"
				status={message?.type}
				width="100%"
			>
				Password
			</Input.Password>
			<Spacer />
			<Input.Password
				type="password"
				placeholder="Repeat Password"
				onChange={(e) => setRepeat(e.currentTarget.value)}
				required
				size="large"
				status={message?.type}
				width="100%"
			>
				Repeat Password
			</Input.Password>
			{message && <SigninLayoutMessage message={message} />}

			<Spacer />

			<SigninButton
				disabled={loading}
				loading={loading}
				onClick={() => {
					handleReset().catch(sentryException);
				}}
			>
				{loading ? "Resetting..." : "Reset Password"}
			</SigninButton>
		</SigninLayout>
	);
}
