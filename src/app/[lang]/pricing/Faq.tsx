"use client";

import { Collapse, Page, Spacer, Text } from "@/components/Geist";
import React from "react";
import { Dictionary } from "@/dictionaries";
import Markdown from "marked-react";

export function Faq(props: { d: Dictionary }) {
	const d = props.d.pricing;

	return (
		<Page>
			<Text className="text-center" h2>
				{d.faq.title}
			</Text>
			<Spacer h={2} />
			<Collapse.Group>
				<Collapse title={d.faq.verify_1m_emails_q} initialVisible>
					<Markdown>{d.faq.verify_1m_emails_a}</Markdown>
				</Collapse>
				<Collapse title={d.faq.refund_q}>
					<Markdown>{d.faq.refund_a}</Markdown>
				</Collapse>
				<Collapse title={d.faq.free_trial_q}>
					<Markdown>{d.faq.free_trial_a}</Markdown>
				</Collapse>
				<Collapse title={d.faq.another_q}>
					<Markdown>{d.faq.another_a}</Markdown>
				</Collapse>
			</Collapse.Group>
		</Page>
	);
}
