import { Input, Link as GLink, Note, Spacer, Text } from '@geist-ui/react';
import {
	CardElement,
	Elements,
	useElements,
	useStripe,
} from '@stripe/react-stripe-js';
import type {
	ApiError,
	Provider,
	Session,
	User as GoTrueUser,
	UserCredentials,
} from '@supabase/gotrue-js';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import {
	SigninButton,
	SigninLayout,
	SigninLayoutMessage,
	SigninMessage,
} from '../components';
import { sentryException } from '../util/sentry';
import { getStripe } from '../util/stripeClient';
import { useUser } from '../util/useUser';
import styles from './signup.module.css';

function SignUp(): React.ReactElement {
	const stripe = useStripe();
	const elements = useElements();
	const router = useRouter();
	const { user, signUp } = useUser();

	// Input form state.
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<SigninMessage | undefined>(
		undefined
	);

	// Whether or not to show the "Why Credit Card?" info box.
	const [showWhyCC, setShowWhyCC] = useState(false);

	// These states serve as cache. We do multiple steps during sign up:
	// - sign up on supabase
	// - confirm card number on Stripe
	// To avoid hitting the first endpoint again (on failed sign up attempts)
	// we cache the results here.
	const [signedUpUser, setSignedUpUser] = useState<GoTrueUser | undefined>();

	const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
		try {
			// We don't want to let default form submission happen here,
			// which would refresh the page.
			e.preventDefault();

			if (!stripe || !elements) {
				// Stripe.js has not yet loaded.
				// Make sure to disable form submission until Stripe.js has loaded.
				return;
			}

			setLoading(true);
			setMessage(undefined);

			const attemptSignUp = async (
				creds: UserCredentials
			): Promise<{
				session: Session | null;
				user: GoTrueUser | null;
				provider?: Provider;
				url?: string | null;
				error: ApiError | null;
			}> => {
				if (signedUpUser) {
					return {
						session: null,
						error: null,
						user: signedUpUser,
					};
				}

				const res = await signUp(creds);

				if (!res.user) {
					throw new Error('No new user returned.');
				}

				setSignedUpUser(res.user);

				return res;
			};

			const { error, user: newUser } = await attemptSignUp({
				email,
				password,
			});
			if (error) {
				throw error;
			}

			if (!newUser) {
				throw new Error('No new user returned.');
			}

			// Verify cards details.
			const card = elements.getElement('card');
			if (!card) {
				throw new Error('No card element found.');
			}
			// We only use `createPaymentMethod` to verify payment methods. A
			// more correct way would be to use SetupIntents, and attach that
			// payment method to the customer. But we don't do that here.
			//
			// This also doesn't actually verify the card works (i.e. do an
			// actual card confirmation), I think, so it's just a quick check.
			const { error: stripeError } = await stripe.createPaymentMethod({
				type: 'card',
				card,
			});

			if (stripeError) {
				throw stripeError;
			}

			setMessage({
				type: 'success',
				content:
					'Signed up successfully. Check your email for the confirmation link.',
			});
		} catch (error) {
			setMessage({
				type: 'error',
				content: (error as Error)?.message,
			});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (user) {
			router.replace('/dashboard').catch(sentryException);
		}
	}, [router, user]);

	// Did the user successfully sign up?
	const isSuccessfulSignUp = message?.type === 'success';

	return (
		<SigninLayout title="Sign Up">
			<form
				onSubmit={(e) => {
					handleSignup(e).catch(sentryException);
				}}
			>
				<Input
					disabled={isSuccessfulSignUp}
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
					disabled={isSuccessfulSignUp}
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

				{/* Stripe credit card input */}
				<Spacer y={0.5} />
				<Text>
					Credit Card (
					<GLink
						color
						onClick={(e) => {
							e.preventDefault();
							setShowWhyCC(!showWhyCC);
						}}
						underline
					>
						{showWhyCC ? 'Hide ▲' : 'Why? ▼'}
					</GLink>
					)
					{showWhyCC && (
						<>
							<Spacer />
							<Note label={false} small>
								💡 For better verification results, Reacher
								needs to maintain its servers&apos; IP
								reputation. Requiring credit card info here
								reduces spam sign-ups, which helps maintaining
								the IP health.
							</Note>
						</>
					)}
				</Text>

				<Spacer y={0.5} />
				<div className={styles.inputWrapper}>
					<CardElement options={{ disabled: isSuccessfulSignUp }} />
				</div>

				<Spacer />
				<Text em small>
					We won&apos;t charge you until you <u>manually</u> upgrade
					your pricing plan.
				</Text>

				{message && <SigninLayoutMessage message={message} />}

				<Spacer />

				<SigninButton
					disabled={loading || isSuccessfulSignUp}
					loading={loading}
					htmlType="submit"
					type={isSuccessfulSignUp ? 'success' : undefined}
				>
					{isSuccessfulSignUp
						? 'Success'
						: loading
						? 'Signing up...'
						: 'Sign up'}
				</SigninButton>

				<Text p className="text-center">
					Already have an account?{' '}
					<GLink color href="/login" underline>
						Log in.
					</GLink>
				</Text>
			</form>
		</SigninLayout>
	);
}

// Same as the SignUp components, but we wrap it inside the Stripe Elements
// provider, so that we can use the CardElement component inside.
export default function SignUpPage() {
	return (
		<Elements stripe={getStripe()}>
			<SignUp />
		</Elements>
	);
}
