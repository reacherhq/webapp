/**
 * Format a number as 2.5K if a thousand or more, otherwise 900.
 *
 * @param num - The number to format.
 * @see https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
 */
export function kFormatter(n: number): string {
	if (n < 1e3) return n.toString();
	if (n < 1e6) return `${+(n / 1e3).toFixed(1)}K`;
	if (n < 1e9) return `${+(n / 1e6).toFixed(1)}M`;
	if (n < 1e12) return `${+(n / 1e9).toFixed(1)}B`;
	return `${+(n / 1e12).toFixed(1)}T`;
}
