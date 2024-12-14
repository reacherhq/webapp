"use client";

import { Dictionary } from "@/dictionaries";
import {
	Button,
	Card,
	Loading,
	Snippet,
	Spacer,
	Text,
} from "@/components/Geist";
import Markdown from "marked-react";
import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import CheckCircle from "@geist-ui/react-icons/checkCircle";
import ArrowRight from "@geist-ui/react-icons/arrowRight";
import { postData } from "@/util/helpers";
import { Session } from "@supabase/supabase-js";
import Link from "next/link";

export function GetStartedCommercial(props: {
	session: Session;
	d: Dictionary;
}) {
	const d = props.d.dashboard.get_started_license;
	const session = props.session;
	// Have we checked the docker image yet?
	const [hasCheckedDockerOnce, setHasCheckedDockerOnce] = useState(false);
	// Have we requested the docker image yet?
	const [hasRequestedDocker, setHasRequestedDocker] = useState(false);
	// Is the docker image ready on the docker hub?
	const [isDockerReady, setIsDockerReady] = useState(false);
	// Error message if the docker image couldn't be generated
	const [generateDockerError, setGenerateDockerError] = useState("");

	const isLoading =
		hasRequestedDocker && !isDockerReady && !generateDockerError;

	async function checkDockerImage() {
		try {
			const res = await axios.get(`/api/docker/image-exists`);
			if (res.status === 200) {
				setIsDockerReady(true);
			} else {
				throw new Error("Docker image not ready");
			}
		} catch (error) {}
	}

	useEffect(() => {
		// Try every 2s to ping the docker hub endpoint to see if the user's
		// docker image is ready to be pulled.
		checkDockerImage().then(() => {
			setHasCheckedDockerOnce(true);
		}); // Fire once on mount
		const interval = setInterval(checkDockerImage, 2000); // Fire and forget every 2s

		return () => clearInterval(interval);
	});

	async function handleRequestDockerImage() {
		try {
			setGenerateDockerError("");
			setHasRequestedDocker(true);
			await postData({ url: "/api/github/generate-docker" });
		} catch (err) {
			console.log(err);
			setGenerateDockerError((err as AxiosError).message);
		}
	}

	if (!hasCheckedDockerOnce) {
		return <Loading />;
	}

	return (
		<>
			{(!isDockerReady || hasRequestedDocker) && (
				<Card>
					<Text h3>
						{d.request_docker_title}
						{isDockerReady && `: ${d.request_docker_finished}`}
					</Text>

					<>
						<Markdown>{d.explanation}</Markdown>
						<Markdown>{d.run_docker_features}</Markdown>
						<div className="text-center">
							<Button
								type="success"
								iconRight={
									isDockerReady ? (
										<CheckCircle />
									) : hasRequestedDocker ? undefined : (
										<ArrowRight />
									)
								}
								disabled={isDockerReady}
								loading={isLoading}
								onClick={handleRequestDockerImage}
							>
								{isDockerReady
									? "Docker image ready "
									: generateDockerError
									? "Request Docker Image Again"
									: hasRequestedDocker
									? "Loading..."
									: "Request Docker Image"}
							</Button>
							{generateDockerError && (
								<Text p small type="error">
									{generateDockerError}
								</Text>
							)}
							{isLoading && (
								<Text p small>
									{d.has_requested_docker}
								</Text>
							)}
						</div>
					</>
				</Card>
			)}
			<Spacer />
			{isDockerReady && (
				<Card>
					<Text h3>{d.run_docker_title}</Text>
					<Markdown>{d.run_docker_setup_server}</Markdown>
					<Snippet
						symbol=""
						text={`docker run -p 8080:8080 reachertrial/backend-${session.user.id}:latest`}
						type="lite"
						width="100%"
					/>
					<Markdown>{d.run_docker_features}</Markdown>
					<Markdown>{d.run_docker_contact}</Markdown>
				</Card>
			)}
			<Spacer />
			{isDockerReady && (
				<Card>
					<Text h3>{d.purchase_license_title}</Text>
					<Markdown>{d.purchase_license_explanation}</Markdown>
					<div className="text-center">
						<Link href="/pricing">
							<Button type="success">
								{d.purchase_license_button}
							</Button>
						</Link>
					</div>
				</Card>
			)}
		</>
	);
}
