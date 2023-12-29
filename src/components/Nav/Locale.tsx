"use client";

import { Select } from "@/components/Geist";
import React from "react";
import styles from "./Nav.module.css";
import { usePathname, useRouter } from "next/navigation";
import { getLocale } from "@/dictionaries";

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
