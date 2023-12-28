import { Input, Note, Spacer } from "@geist-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

import {
	SigninButton,
	SigninLayout,
	SigninLayoutMessage,
	SigninMessage,
} from "../components/SigninLayout";
import { parseHashComponents } from "@/util/helpers";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";
import { dictionary } from "@/dictionaries";

export default function ResetPasswordPartTwo(): React.ReactElement {
	const router = useRouter();
	const [password, setPassword] = useState("");
	const [repeat, setRepeat] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<SigninMessage | undefined>(
		undefined
	);
	const [isInvite, setIsInvite] = useState(false); // Landed on this page on first visit, via Invite Link.
	const d = dictionary(router.locale).reset_password.part2;
	const { user, supabase } = useUser();

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
		}
	}, [router]);

	const handleReset = async () => {
		if (password !== repeat) {
			setMessage({
				type: "error",
				content: d.error_passwords_dont_match,
			});
			return;
		}

		setLoading(true);
		setMessage(undefined);

		const { error } = await supabase.auth.updateUser({
			password,
		});
		setLoading(false);
		if (error) {
			setMessage({ type: "error", content: error?.message });
		} else {
			setMessage({
				type: "success",
				content: d.success,
			});
			router.push("/dashboard").catch(sentryException);
		}
	};

	return (
		<SigninLayout title={d.title}>
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
				placeholder="Password"
				onChange={(e) => setPassword(e.currentTarget.value)}
				required
				type={message?.type}
				width="100%"
			>
				{d.password}
			</Input.Password>
			<Spacer />
			<Input.Password
				placeholder={d.password_confirm}
				onChange={(e) => setRepeat(e.currentTarget.value)}
				required
				type={message?.type}
				width="100%"
			>
				{d.password_confirm}
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
				{loading ? d.button_setting : d.button_set}
			</SigninButton>
		</SigninLayout>
	);
}
