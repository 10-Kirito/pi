/**
 * Rough token estimate used for the thinking progress indicator.
 * CJK characters count ~1 token each; everything else ~4 chars per token.
 */
export function estimateTokens(text: string): number {
	let cjk = 0;
	let other = 0;
	for (const ch of text) {
		const code = ch.codePointAt(0) ?? 0;
		if (code >= 0x2e80 && code <= 0x9fff) {
			cjk++;
		} else {
			other++;
		}
	}
	return Math.max(1, cjk + Math.round(other / 4));
}
