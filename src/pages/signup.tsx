import { Input, Link as GLink, Select, Spacer, Text } from '@geist-ui/react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

import {
	SigninButton,
	SigninLayout,
	SigninLayoutMessage,
	SigninMessage,
} from '../components';
import { sentryException } from '../util/sentry';
import { useUser } from '../util/useUser';

function Feedback({
	onChange,
}: {
	onChange: (f: string) => void;
}): React.ReactElement {
	const [option, setOption] = useState<string | undefined>();

	return (
		<>
			<Text>How did you hear about Reacher?</Text>
			<Select
				placeholder="Please select an option"
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
				<Select.Option value="other">Other</Select.Option>
			</Select>

			{option === 'google' && (
				<>
					<Spacer />
					<Input
						placeholder='e.g. "email verification api"'
						onChange={(e) => {
							const s = e.currentTarget.value;
							onChange(`${option}:${s}`);
						}}
						width="100%"
					>
						Which search terms did you use?
					</Input>
				</>
			)}
			{option === 'other' && (
				<>
					<Spacer />
					<Input
						placeholder='e.g. "word of mouth", "blog <name>", "website <name.com>"...'
						onChange={(e) => {
							const s = e.currentTarget.value;
							onChange(`${option}:${s}`);
						}}
						width="100%"
					>
						Could you share some details?
					</Input>
				</>
			)}
		</>
	);
}

export default function SignUp(): React.ReactElement {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<SigninMessage | undefined>(
		undefined
	);
	const [feedback, setFeedback] = useState<string | undefined>();
	const [passedCatpcha, setPassedCatpcha] = useState(false);

	const captchaRef = useRef<HCaptcha>(null);

	const router = useRouter();
	const { user, signUp } = useUser();

	const onLoad = () => {
		// this reaches out to the hCaptcha JS API and runs the
		// execute function on it. you can use other functions as
		// documented here:
		// https://docs.hcaptcha.com/configuration#jsapi
		captchaRef?.current?.execute();
	};

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
			setMessage({ type: 'error', content: error?.message });
		} else {
			setMessage({
				type: 'success',
				content:
					'Signed up successfully. Check your email for the confirmation link.',
			});
		}
		setLoading(false);
	};

	useEffect(() => {
		if (user) {
			router.replace('/dashboard').catch(sentryException);
		}
	}, [router, user]);

	return (
		<SigninLayout title="Sign Up">
			<Input
				type="email"
				placeholder="Email"
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
			<Feedback onChange={setFeedback} />
			{message && <SigninLayoutMessage message={message} />}

			<Spacer />

			<div className="text-center">
				<HCaptcha
					sitekey="e8cdd278-b060-4c52-9625-7719ee025d5a" // Public site key
					onLoad={onLoad}
					onVerify={() => setPassedCatpcha(true)}
					ref={captchaRef}
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
				{loading ? 'Signing up...' : 'Sign up'}
			</SigninButton>

			<Text p className="text-center">
				Already have an account?{' '}
				<GLink color href="/login" underline>
					Log in.
				</GLink>
			</Text>
		</SigninLayout>
	);
}
