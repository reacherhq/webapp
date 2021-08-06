import { Input, Spacer } from '@geist-ui/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import {
	SigninButton,
	SigninLayout,
	SigninLayoutMessage,
	SigninMessage,
} from '../components';
import { parseHashComponents } from '../util/helpers';
import { sentryException } from '../util/sentry';
import { supabase } from '../util/supabaseClient';

export default function ResetPasswordPartTwo(): React.ReactElement {
	const router = useRouter();
	const [accessToken, setAccessToken] = useState('');
	const [password, setPassword] = useState('');
	const [repeat, setRepeat] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<SigninMessage | undefined>(
		undefined
	);

	useEffect(() => {
		// Password recovery.
		// https://supabase.io/docs/reference/javascript/reset-password-email#notes
		if (typeof window !== 'undefined' && window.location.hash) {
			const hashComponents = parseHashComponents(window.location.hash);
			if (
				hashComponents.type !== 'recovery' ||
				!hashComponents.access_token
			) {
				router.replace('/').catch(sentryException);
				return;
			}

			setAccessToken(hashComponents.access_token);
		}
	}, [router]);

	const handleReset = async () => {
		if (password !== repeat) {
			setMessage({
				type: 'error',
				content: 'The two passwords must match.',
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
			setMessage({ type: 'error', content: error?.message });
		} else {
			setMessage({
				type: 'success',
				content: 'Password updated successfully.',
			});
			router.push('/').catch(sentryException);
		}
	};

	return (
		<SigninLayout title="Reset Password">
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
				onClick={handleReset}
			>
				{loading ? 'Resetting...' : 'Reset Password'}
			</SigninButton>
		</SigninLayout>
	);
}
