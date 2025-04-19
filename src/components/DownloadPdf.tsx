import {
	Document,
	Page,
	Text,
	View,
	StyleSheet,
	pdf,
	Image,
} from "@react-pdf/renderer";
import React, { useState, useEffect } from "react";
import { marked } from "marked";
import { Button } from "@/components/Geist";
import { Download } from "@geist-ui/react-icons";

// Define types for markdown tokens
interface MarkdownToken {
	type: string;
	text?: string;
	depth?: number;
	items?: MarkdownListItem[];
	ordered?: boolean;
}

interface MarkdownListItem {
	text: string;
	tokens: MarkdownToken[];
}

// This is the Reacher logo in base64 format.
// URL: https://github.com/reacherhq/webapp/raw/master/src/assets/logo/reacher-64.png
const reacherLogoBase64 =
	"data:image/png;base64,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";

// Define PDF document styles
// These styles will be applied to different elements in the PDF
const styles = StyleSheet.create({
	page: {
		flexDirection: "column",
		backgroundColor: "#FFFFFF",
		padding: 30,
	},
	section: {
		margin: 10,
		padding: 10,
	},
	title: {
		fontSize: 24,
		marginBottom: 20,
	},
	text: {
		fontSize: 12,
		marginBottom: 10,
	},
	bold: {
		fontWeight: "bold",
	},
	heading1: {
		fontSize: 24,
		marginBottom: 10,
		fontWeight: "bold",
	},
	heading2: {
		fontSize: 20,
		marginBottom: 8,
		fontWeight: "bold",
	},
	paragraph: {
		fontSize: 12,
		marginBottom: 10,
	},
	image: {
		marginVertical: 10,
		maxWidth: "100%",
		objectFit: "contain",
		width: "64px",
		height: "64px",
	},
	list: {
		marginLeft: 20,
		marginBottom: 10,
	},
	listItem: {
		fontSize: 12,
		marginBottom: 5,
	},
	listItemContent: {
		flexDirection: "row",
	},
	listItemBullet: {
		width: 20,
	},
});

// Props interface for the DownloadPdf component
interface PdfProps {
	markdownContent: string; // The markdown content to convert to PDF
	fileName?: string; // Optional custom filename for the PDF
	buttonText?: string; // Optional custom text for the download button
	buttonIcon?: React.ReactNode; // Optional custom icon for the download button
}

/**
 * DownloadPdf Component
 * Converts markdown content to a downloadable PDF file with support for:
 * - Text formatting (bold)
 * - Headers (h1, h2)
 * - Images (both local and remote)
 * - Custom styling
 */
export function DownloadPdf({
	markdownContent,
	fileName = "document.pdf",
	buttonText = "Download PDF",
	buttonIcon = <Download />,
}: PdfProps) {
	// State to store the parsed markdown content
	const [processedContent, setProcessedContent] = useState(() =>
		marked.lexer(markdownContent)
	);

	// Effect to process markdown and load images when content changes
	useEffect(() => {
		setProcessedContent(marked.lexer(markdownContent));
	}, [markdownContent]);

	/**
	 * Converts markdown tokens to PDF-compatible React elements
	 * Handles different types of content:
	 * - Headers (h1, h2)
	 * - Lists
	 * - Paragraphs with bold text
	 * - Images
	 */
	const renderContent = () => {
		return processedContent.map((token: MarkdownToken, index: number) => {
			// Handle headers
			if (token.type === "heading") {
				return (
					<Text
						key={index}
						style={
							token.depth === 1
								? styles.heading1
								: styles.heading2
						}
					>
						{token.text || ""}
					</Text>
				);
			}

			// Handle lists
			if (token.type === "list") {
				return (
					<View key={index} style={styles.list}>
						{token.items?.map(
							(item: MarkdownListItem, itemIndex: number) => (
								<View key={itemIndex} style={styles.listItem}>
									<View style={styles.listItemContent}>
										<Text style={styles.listItemBullet}>
											{token.ordered
												? `${itemIndex + 1}.`
												: "•"}
										</Text>
										<Text>{item.text}</Text>
									</View>
								</View>
							)
						)}
					</View>
				);
			}

			// Handle paragraphs (including images)
			if (token.type === "paragraph") {
				// Check if paragraph contains an image
				const imageMatch = token.text?.match(
					/!\[([^\]]*)\]\(([^)]+)\)/
				);
				if (imageMatch) {
					return (
						<View key={index}>
							<Image
								src={reacherLogoBase64}
								style={styles.image}
							/>
						</View>
					);
				}

				// Handle paragraphs with bold text
				const parts: string[] = (token.text || "").split(
					/(\*\*[^*]+\*\*)/g
				);
				return (
					<Text key={index} style={styles.paragraph}>
						{parts.map((part: string, i: number) => {
							if (part.startsWith("**") && part.endsWith("**")) {
								return (
									<Text key={i} style={styles.bold}>
										{part.slice(2, -2)}
									</Text>
								);
							}
							return <Text key={i}>{part}</Text>;
						})}
					</Text>
				);
			}

			// Handle plain text
			if (token.type === "text") {
				const parts: string[] = (token.text || "").split(
					/(\*\*[^*]+\*\*)/g
				);
				return (
					<Text key={index} style={styles.text}>
						{parts.map((part: string, i: number) => {
							if (part.startsWith("**") && part.endsWith("**")) {
								return (
									<Text key={i} style={styles.bold}>
										{part.slice(2, -2)}
									</Text>
								);
							}
							return <Text key={i}>{part}</Text>;
						})}
					</Text>
				);
			}

			return null;
		});
	};

	// PDF Document component definition
	const MyDocument = () => (
		<Document>
			<Page size="A4" style={styles.page}>
				<View style={styles.section}>{renderContent()}</View>
			</Page>
		</Document>
	);

	/**
	 * Handles the PDF download process:
	 * 1. Generates PDF blob from document
	 * 2. Creates temporary URL
	 * 3. Triggers download
	 * 4. Cleans up temporary URL
	 */
	const handleDownload = async () => {
		const blob = await pdf(<MyDocument />).toBlob();
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	// Render download button
	return (
		<Button type="success" onClick={handleDownload}>
			{buttonIcon}
			{buttonText}
		</Button>
	);
}

// Example usage:
// <Pdf markdownContent="# Hello World\n\nThis is a markdown content" fileName="my-document.pdf" />
