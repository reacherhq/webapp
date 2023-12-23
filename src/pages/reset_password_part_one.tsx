import { Input, Spacer } from "@geist-ui/react";
import React, { useState } from "react";

import {
	SigninButton,
	SigninLayout,
	SigninLayoutMessage,
	SigninMessage,
} from "../components/SigninLayout";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";
import { dictionary } from "@/dictionaries";
import { useRouter } from "next/router";

export default function ResetPasswordPartOne(): React.ReactElement {
	const [email, setEmail] = useState("");
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<SigninMessage | undefined>(
		undefined
	);
	const router = useRouter();
	const d = dictionary(router.locale).reset_password.part1;
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
				content: d.success,
			});
		}
	};

	return (
		<SigninLayout title={d.title}>
			<Input
				placeholder="ex. john.doe@gmail.com"
				onChange={(e) => setEmail(e.currentTarget.value)}
				required
				type={message?.type}
				width="100%"
			>
				{d.email}
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
				{loading ? d.button_resetting : d.button_reset}
			</SigninButton>
		</SigninLayout>
	);
}
