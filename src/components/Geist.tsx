"use client";

import { Themes } from "@geist-ui/react";
export * from "@geist-ui/react";
export { default as SelectOption } from "@geist-ui/react/esm/select/select-option";
export { default as GridContainer } from "@geist-ui/react/esm/grid/grid-container";

export const myTheme = Themes.createFromLight({
	type: "default",
	palette: {
		errorDark: "#ff128a", // Accent Color Pink
		foreground: "#3a3a3a", // Neutral Almost Black
		success: "#6979f8", // Primary Blue
		link: "#6979f8",
		cyan: "#6979f8",
		secondary: "#999999", // Neutral Light Gray
	},
});
