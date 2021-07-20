import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { Nav } from '../components';
import { sentryException } from '../util/sentry';
import { updateUserName } from '../util/supabaseClient';
import { useUser } from '../util/useUser';

export default function SignUp(): React.ReactElement {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<{ type?: string; content?: string }>(
		{}
	);
	const router = useRouter();
	const { user, signUp } = useUser();

	const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		setLoading(true);
		setMessage({});
		const { error, user: newUser } = await signUp({ email, password });
		if (error) {
			setMessage({ type: 'error', content: error?.message });
		} else {
			if (newUser) {
				await updateUserName(newUser, name);
			} else {
				setMessage({
					type: 'note',
					content: 'Check your email for the confirmation link.',
				});
			}
		}
		setLoading(false);
	};

	useEffect(() => {
		if (user) {
			router.replace('/account').catch(sentryException);
		}
	}, [router, user]);

	return (
		<>
			<Nav />
			{user ? (
				<p>Redirecting...</p>
			) : (
				<section className="section thin-container columns">
					<div className="column col-8 col-mx-auto">
						<h2>Sign up</h2>
						<form onSubmit={handleSignup}>
							{message.content && <div>{message.content}</div>}
							<div className="form-group">
								<input
									placeholder="Name"
									onChange={(e) =>
										setName(e.currentTarget.value)
									}
								/>
							</div>
							<div className="form-group">
								<input
									type="email"
									placeholder="Email"
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
									onChange={(e) =>
										setPassword(e.currentTarget.value)
									}
								/>
							</div>

							<button
								className="btn btn-primary"
								type="submit"
								disabled={
									loading || !email.length || !password.length
								}
							>
								Sign up
							</button>
						</form>

						<p>
							Already have an account?
							<Link href="/signin">
								<button className="btn btn-link">
									Sign in.
								</button>
							</Link>
						</p>
					</div>
				</section>
			)}
		</>
	);
}
