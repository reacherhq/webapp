import { Loading, Page } from "@geist-ui/react";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useState } from "react";
import { parseHashComponents, postData } from "@/util/helpers";
import { sentryException } from "@/util/sentry";
import { useUser } from "@/util/useUser";
import { getActiveProductsWithPrices } from "@/supabase/supabaseServer";

export const getStaticProps: GetStaticProps = async () => {
	const products = await getActiveProductsWithPrices();

	return {
		props: {
			products,
		},
	};
};

export default function Index(): React.ReactElement {
	const router = useRouter();
	const { user, userLoaded, subscription } = useUser();
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [emailSent, setEmailSent] = useState(false); // Set if we sent an email upon confirmation. Only do it once.

	useEffect(() => {
		if (isRedirecting) {
			return;
		}

		const hashComponents =
			typeof window !== "undefined" && window.location.hash
				? parseHashComponents(window.location.hash)
				: {};

		// On signup (after email confirmation), add a contact to SendInBlue.
		// Only do it once.
		if (
			!emailSent &&
			hashComponents.access_token &&
			hashComponents.type === "signup"
		) {
			setEmailSent(true);
			postData({
				url: "/api/sendinblue/create-contact",
			}).catch(sentryException);
		}

		// Below is the router from the index '/' page. It's one of:
		// - /reset_password_part_two
		// - /login
		// - /dashboard

		// Password recovery.
		// https://supabase.io/docs/reference/javascript/reset-password-email#notes
		if (
			hashComponents.access_token &&
			(hashComponents.type === "invite" ||
				hashComponents.type === "recovery")
		) {
			setIsRedirecting(true);
			router
				.replace(`/reset_password_part_two${window.location.hash}`)
				.catch(sentryException);
		} else if (userLoaded && !user) {
			setIsRedirecting(true);
			router.replace("/login").catch(sentryException);
		} else if (userLoaded && user) {
			setIsRedirecting(true);
			router.replace("/dashboard").catch(sentryException);
		}
	}, [isRedirecting, router, userLoaded, user, emailSent, subscription]);

	return (
		<Page>
			<Loading />
		</Page>
	);
}
