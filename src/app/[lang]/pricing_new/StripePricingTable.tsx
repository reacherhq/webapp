"use client";

import React, { useEffect } from "react";

export const StripePricingTable = () => {
	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://js.stripe.com/v3/pricing-table.js";
		script.async = true;
		document.body.appendChild(script);
		return () => {
			document.body.removeChild(script);
		};
	}, []);

	return React.createElement("stripe-pricing-table", {
		"pricing-table-id": "prctbl_1OOqJhA852XqldwXWBnBH1qL",
		"publishable-key": "pk_live_O6JxAuRV03zH5EC0V2aEqD1F00PqJvtIsb",
	});
};
