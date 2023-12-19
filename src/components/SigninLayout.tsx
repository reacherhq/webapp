import { Button, Grid, Loading, Text } from "@geist-ui/react";
import type { ButtonProps } from "@geist-ui/react/dist/button/button";
import { CheckCircle, XCircle } from "@geist-ui/react-icons";
import type { User } from "@supabase/supabase-js";
import React from "react";

import styles from "./SigninLayout.module.css";

interface SiginLayoutProps extends React.HTMLProps<HTMLDivElement> {
	title: string;
	user?: User;
}

export function SigninLayout({
	children,
	title,
	user,
}: SiginLayoutProps): React.ReactElement {
	return (
		<Grid.Container className={styles.container} gap={2} justify="center">
			<Grid xs={8}>
				{user ? (
					<Loading />
				) : (
					<div className="full-width">
						<Text className="text-center" h3>
							{title}
						</Text>
						{children}
					</div>
				)}
			</Grid>
		</Grid.Container>
	);
}

export interface SigninMessage {
	type: "error" | "success";
	content: string;
}

interface SigninLayoutMessageProps {
	message: SigninMessage;
}

export function SigninLayoutMessage({
	message,
}: SigninLayoutMessageProps): React.ReactElement {
	return (
		<Text small p type={message.type}>
			{message.type === "error" ? (
				<XCircle size={16} />
			) : (
				<CheckCircle size={16} />
			)}{" "}
			{message.content}
		</Text>
	);
}

export function SigninButton({
	children,
	className = styles.button,
	size = "large",
	type = "secondary",
	...rest
}: Partial<ButtonProps>): React.ReactElement {
	return (
		<Button className={className} size={size} type={type} {...rest}>
			{children}
		</Button>
	);
}
