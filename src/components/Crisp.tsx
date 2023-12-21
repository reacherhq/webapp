/* eslint-disable @typescript-eslint/ban-ts-comment */

import { useUser } from "@/util/useUser";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Crisp(): null {
	const router = useRouter();
	const { user } = useUser();

	useEffect(() => {
		// @ts-expect-error
		window.CRISP_RUNTIME_CONFIG = {
			locale: router.locale || "en",
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
	}, []);

	useEffect(() => {
		if (!user?.email) {
			return;
		}

		// @ts-expect-error
		window.$crisp.push(["set", "user:email", user.email]);
	}, []);

	return null;
}
