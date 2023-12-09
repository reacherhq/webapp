import { Input, Spacer } from "@geist-ui/react";
import React, { useState } from "react";

import {
	SigninButton,
	SigninLayout,
	SigninLayoutMessage,
	SigninMessage,
} from "../components";
import { sentryException } from "../util/sentry";
import { useUser } from "../util/useUser";

export default function ResetPasswordPartOne(): React.ReactElement {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<SigninMessage | undefined>(
		undefined
	);

	const { resetPassword } = useUser();

	const handleResetPassword = async () => {
		setLoading(true);
		setMessage(undefined);

		const { error } = await resetPassword(email);
		setLoading(false);
		if (error) {
			setMessage({ type: "error", content: error.message });
		} else {
			setMessage({
				type: "success",
				content: "Check your email for resetting the password.",
			});
		}
	};

	return (
		<SigninLayout title="Reset Password">
			<Input
				type="email"
				placeholder="ex. john.doe@gmail.com"
				onChange={(e) => setEmail(e.currentTarget.value)}
				required
				size="large"
				status={message?.type}
				width="100%"
			>
				Email
			</Input>
			{message && <SigninLayoutMessage message={message} />}

			<Spacer />
			<SigninButton
				disabled={loading}
				loading={loading}
				onClick={() => {
					handleResetPassword().catch(sentryException);
				}}
			>
				{loading ? "Resetting..." : "Reset Password"}
			</SigninButton>
		</SigninLayout>
	);
}
