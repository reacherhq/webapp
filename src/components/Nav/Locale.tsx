"use client";

import { Select } from "@/components/Geist";
import React from "react";
import styles from "./Nav.module.css";
import { usePathname, useRouter } from "next/navigation";

export function Locale() {
	const pathname = usePathname();
	const router = useRouter();

	return (
		<Select
			className={styles.language}
			disableMatchWidth
			onChange={(v) => {
				router.push(redirectedPathname(pathname, v as string));
			}}
			value={getLocale(pathname)}
		>
			<Select.Option value="en">🇺🇸 English</Select.Option>
			<Select.Option value="fr">🇫🇷 Français</Select.Option>
		</Select>
	);
}

const redirectedPathname = (pathname: string | null, locale: string) => {
	if (!pathname) return "/";
	const segments = pathname.split("/");
	segments[1] = locale;
	return segments.join("/");
};

// Get locale from pathname.
function getLocale(pathname: string | null) {
	if (!pathname) return "en";
	const segments = pathname.split("/");
	if (segments[1] === "fr") return "fr";
	return "en";
}
