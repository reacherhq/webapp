import React from "react";
import { useRouter } from "next/router";
import { dictionary } from "@/dictionaries";

export function GetStartedBulk(): React.ReactElement {
	const router = useRouter();
	const d = dictionary(router.locale).dashboard.get_started_no_plan;

	return <p>TODO BULK</p>;
}
