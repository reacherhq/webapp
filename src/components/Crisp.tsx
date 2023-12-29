"use client";

/* eslint-disable @typescript-eslint/ban-ts-comment */

import { createClient } from "@/supabase/client";
import { sentryException } from "@/util/sentry";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function Crisp() {
	const supabase = createClient();
	const pathname = usePathname();
	const lang = pathname?.split("/")[1];

	useEffect(() => {
		// @ts-expect-error
		window.CRISP_RUNTIME_CONFIG = {
			locale: lang || "en",
		};

		// @ts-ignore
		window.$crisp = [];
		// @ts-ignore
		window.CRISP_WEBSITE_ID = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;
		(() => {
			const d = document;
			const s = d.createElement("script");
			s.src = "https://client.crisp.chat/l.js";
			// @ts-ignore
			s.async = 1;
			d.getElementsByTagName("body")[0].appendChild(s);
		})();
	}, [lang]);

	useEffect(() => {
		supabase.auth
			.getUser()
			.then(({ data: { user } }) => {
				if (!user?.email) {
					return;
				}

				// @ts-expect-error
				window.$crisp.push(["set", "user:email", user?.email]);
			})
			.catch(sentryException);
	}, [supabase]);

	return null;
}
