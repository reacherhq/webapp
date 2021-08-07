import { Input, Link as GLink, Spacer, Text } from '@geist-ui/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import {
	SigninButton,
	SigninLayout,
	SigninLayoutMessage,
	SigninMessage,
} from '../components';
import { sentryException } from '../util/sentry';
import { updateUserName } from '../util/supabaseClient';
import { useUser } from '../util/useUser';

export default function SignUp(): React.ReactElement {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<SigninMessage | undefined>(
		undefined
	);
	const router = useRouter();
	const { user, signUp } = useUser();

	const handleSignup = async () => {
		setLoading(true);
		setMessage(undefined);
		const { error, session, user: newUser } = await signUp({
			email,
			password,
		});
		if (error) {
			setMessage({ type: 'error', content: error?.message });
		} else {
			// "If "Email Confirmations" is turned on, a user is returned but session will be null"
			// https://supabase.io/docs/reference/javascript/auth-signup#notes
			if (session && newUser) {
				await updateUserName(newUser, name);
			}
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
				placeholder="Name"
				onChange={(e) => setName(e.currentTarget.value)}
				width="100%"
			>
				Name
			</Input>
			<Spacer />
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
			{message && <SigninLayoutMessage message={message} />}

			<Spacer />

			<SigninButton
				disabled={loading}
				loading={loading}
				onClick={handleSignup}
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
