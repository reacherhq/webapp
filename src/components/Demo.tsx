import { Button, Card, Code, Input, Spacer, Text } from '@geist-ui/react';
import { CheckEmailOutput } from '@reacherhq/api/lib';
import React, { useState } from 'react';

import { postData } from '../util/helpers';
import { sentryException } from '../util/sentry';
import { useUser } from '../util/useUser';

function alertError(e: string) {
	alert(
		`An unexpected error happened. Can you email amaury@reacher.email with this message (or a screenshot)?\n\n${e}`
	);
}

interface DemoProps {
	onVerified?(result: CheckEmailOutput): Promise<void>;
}

export function Demo({ onVerified }: DemoProps): React.ReactElement {
	const { user, userDetails } = useUser();
	const [email, setEmail] = useState('');
	const [loading, setLoading] = useState(false);
	const [result, setResult] = useState<CheckEmailOutput | undefined>();

	function handleVerify() {
		window.sa_event && window.sa_event('dashboard:verify:click');
		if (!email) {
			return;
		}

		setResult(undefined);

		if (!userDetails) {
			alertError(
				`userDetails is undefined for user ${user?.id || 'undefined'}`
			);
			return;
		}

		setLoading(true);
		postData<CheckEmailOutput>({
			url: `/api/v0/check_email`,
			token: userDetails?.api_token,
			data: {
				to_email: email,
			},
		})
			.then((r) => {
				setResult(r);
				setLoading(false);
				return onVerified && onVerified(r);
			})
			.catch((err: Error) => {
				sentryException(err);
				alertError(err.message);
				setLoading(false);
			});
	}

	return (
		<Card>
			<Text h3>Verify an email (quick & easy 💪)</Text>

			<Text>
				Simply enter an email and click &quot;Verify&quot; to get the
				results.
			</Text>

			<div className="text-center">
				<Input
					autoFocus
					disabled={loading}
					onChange={(e) => {
						setEmail(e.target.value);
					}}
					placeholder="test@gmail.com"
					type="success"
					value={email}
				></Input>

				<Spacer />

				<Button
					disabled={loading}
					loading={loading}
					onClick={handleVerify}
					type="success"
				>
					Verify
				</Button>
			</div>

			<Spacer />

			{result && (
				<>
					<Text>
						Congratulations 💪! We got a result with{' '}
						<code>
							is_reachable ={' '}
							<strong>{result.is_reachable}</strong>
						</code>
						, {explanation(result)}. The full response is below,
						check out{' '}
						<a
							href="https://help.reacher.email/email-attributes-inside-json"
							target="_blank"
							rel="noopener noreferrer"
						>
							the documentation
						</a>{' '}
						to understand all the fields.
					</Text>
					<Code block>{JSON.stringify(result, undefined, '  ')}</Code>
				</>
			)}
		</Card>
	);
}

function explanation(result: CheckEmailOutput): string {
	switch (result.is_reachable) {
		case 'invalid':
			return 'which means the email does not exist';
		case 'safe':
			return 'which means the email exists';
		case 'risky':
			return 'which means the email exists, but sending an email there might bounce';
		case 'unknown':
			return "which means Reacher currently isn't able to tell if the email exists or not";
	}
}
