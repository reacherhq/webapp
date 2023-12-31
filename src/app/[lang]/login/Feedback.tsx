import { Input, Select, Spacer } from "@geist-ui/react";
import React, { useState } from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { Dictionary } from "@/dictionaries";

export function Feedback({
	onChange,
	...props
}: {
	d: Dictionary;
	onChange: (f: string) => void;
}): React.ReactElement {
	const [option, setOption] = useState<string | undefined>();
	const d = props.d.signup.feedback;
	return (
		<>
			<label htmlFor="heardFrom">{d.title}</label>
			<Select
				placeholder={d.placeholder}
				onChange={(o) => {
					setOption(o as string);
					onChange(o as string);
				}}
				value={option}
			>
				<Select.Option value="google">Google Search</Select.Option>
				<Select.Option value="github">Github</Select.Option>
				<Select.Option value="blog-geekflare">Geekflare</Select.Option>
				<Select.Option value="blog-du-modérateur">
					Blog du Modérateur
				</Select.Option>
				<Select.Option value="facebook">Facebook</Select.Option>
				<Select.Option value="other">{d.other}</Select.Option>
			</Select>

			{option === "google" && (
				<>
					<Input
						placeholder={d.google_search_placeholder}
						onChange={(e) => {
							const s = e.currentTarget.value;
							onChange(`${option}:${s}`);
						}}
						width="100%"
					>
						{d.google_search_terms}
					</Input>
				</>
			)}
			{option === "other" && (
				<>
					<Input
						placeholder={d.other_placeholder}
						onChange={(e) => {
							const s = e.currentTarget.value;
							onChange(`${option}:${s}`);
						}}
						width="100%"
					>
						{d.other_share_details}
					</Input>
				</>
			)}

			<Spacer />
			<div className="text-center">
				<HCaptcha
					sitekey="e8cdd278-b060-4c52-9625-7719ee025d5a" // Public site key
				/>
			</div>
		</>
	);
}
