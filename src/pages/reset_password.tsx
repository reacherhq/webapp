import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { Nav } from '../components';
import { parseHashComponents } from '../util/helpers';
import { sentryException } from '../util/sentry';
import { supabase } from '../util/supabaseClient';

export default function ResetPassword(): React.ReactElement {
	const router = useRouter();
	const [accessToken, setAccessToken] = useState('');
	const [password, setPassword] = useState('');
	const [repeat, setRepeat] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{ type?: string; content?: string }>(
		{}
	);

	useEffect(() => {
		// Password recovery.
		// https://supabase.io/docs/reference/javascript/reset-password-email#notes
		if (typeof window !== 'undefined' && window.location.hash) {
			const hashComponents = parseHashComponents(window.location.hash);
			if (!hashComponents.access_token) {
				router.replace('/').catch(sentryException);
				return;
			}

			setAccessToken(hashComponents.access_token);
		}
	}, [router]);

	const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setLoading(true);
		setMessage({});
		const { error } = await supabase.auth.api.updateUser(accessToken, {
			password,
		});
		setLoading(false);
		if (error) {
			setMessage({ type: 'error', content: error?.message });
		} else {
			setMessage({
				type: 'note',
				content: 'Password updated successfully.',
			});
			router.push('/').catch(sentryException);
		}
	};

	return (
		<>
			<Nav />
			<section className="section thin-container columns">
				<div className="column col-8 col-mx-auto">
					<h2>Reset Password</h2>
					<p>
						You were redirected from your email to reset your
						password.
					</p>
					<form onSubmit={handleSignup}>
						{message.content && <div>{message.content}</div>}
						<div className="form-group">
							<input
								type="password"
								placeholder="Password"
								onChange={(e) =>
									setPassword(e.currentTarget.value)
								}
							/>
						</div>
						<div className="form-group">
							<input
								type="password"
								placeholder="Repeat Password"
								onChange={(e) =>
									setRepeat(e.currentTarget.value)
								}
							/>
						</div>

						<button
							className="btn btn-primary"
							type="submit"
							disabled={
								loading ||
								!password.length ||
								password !== repeat
							}
						>
							Reset Password
						</button>
					</form>
				</div>
			</section>
		</>
	);
}
