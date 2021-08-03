import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { Nav } from '../components';
import { sentryException } from '../util/sentry';
import { useUser } from '../util/useUser';

export default function Signin(): React.ReactElement {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPasswordInput, setShowPasswordInput] = useState(true);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{ type?: string; content?: string }>(
		{}
	);
	const router = useRouter();
	const { user, resetPassword, signIn } = useUser();

	const handleResetPassword = async () => {
		setLoading(true);
		setMessage({});

		const { error } = await resetPassword(email);
		setLoading(false);
		if (error) {
			setMessage({ type: 'error', content: error.message });
		} else {
			setMessage({
				type: 'note',
				content: 'Check your email for resetting the password.',
			});
		}
	};

	const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setLoading(true);
		setMessage({});

		const { error } = await signIn({ email, password });
		setLoading(false);
		if (error) {
			setMessage({ type: 'error', content: error.message });
		} else if (!password) {
			setMessage({
				type: 'note',
				content: 'Check your email for the magic link.',
			});
		} else {
			setMessage({
				type: 'success',
				content: 'Success, redirecting to your dashboard.',
			});
		}
	};

	useEffect(() => {
		if (user) {
			router.replace('/').catch(sentryException);
		}
	}, [router, user]);

	return (
		<>
			<Nav />

			{user ? (
				<p>Loading...</p>
			) : (
				<section className="section thin-container columns">
					<div className="column col-8 col-mx-auto">
						<h2>Sign in</h2>
						{message.content && (
							<div
								className={`${
									message.type === 'error'
										? 'text-pink'
										: 'text-green'
								} border ${
									message.type === 'error'
										? 'border-pink'
										: 'border-green'
								} p-3`}
							>
								{message.content}
							</div>
						)}

						{showPasswordInput ? (
							<form onSubmit={handleSignin}>
								<div className="form-group">
									<input
										type="email"
										placeholder="Email"
										value={email}
										onChange={(e) =>
											setEmail(e.currentTarget.value)
										}
										required
									/>
								</div>

								<div className="form-group">
									<input
										type="password"
										placeholder="Password"
										value={password}
										onChange={(e) =>
											setPassword(e.currentTarget.value)
										}
										required
									/>
								</div>

								<button
									className="btn btn-primary"
									type="submit"
									disabled={
										loading ||
										!password.length ||
										!email.length
									}
								>
									{loading ? 'Signing in...' : 'Sign in'}
								</button>
							</form>
						) : (
							<form onSubmit={handleSignin}>
								<div className="form-group">
									<input
										type="email"
										placeholder="Email"
										value={email}
										onChange={(e) =>
											setEmail(e.currentTarget.value)
										}
										required
									/>
								</div>
								<button
									type="submit"
									disabled={!email.length || loading}
								>
									{loading ? 'Sending...' : 'Send magic link'}
								</button>
							</form>
						)}

						<button
							className="btn btn-link"
							onClick={() => {
								if (showPasswordInput) setPassword('');
								setShowPasswordInput(!showPasswordInput);
								setMessage({});
							}}
						>
							{`Or sign in with ${
								showPasswordInput ? 'magic link' : 'password'
							}.`}
						</button>

						<p>
							Don&apos;t have an account?
							<Link href="/signup">
								<button className="btn btn-link">
									Sign up.
								</button>
							</Link>
						</p>
						{email && (
							<p>
								Forgot your password?
								<button
									className="btn btn-link"
									onClick={handleResetPassword}
								>
									Reset password.
								</button>
							</p>
						)}
					</div>
				</section>
			)}
		</>
	);
}
