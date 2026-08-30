import { wrapTextWithAnsi } from "@earendil-works/pi-tui";
import { theme } from "../theme/theme.ts";

/** Full-width horizontal rule that visually closes a card. */
export function cardRule(width: number): string {
	return theme.fg("borderMuted", "─".repeat(Math.max(1, width)));
}

/** Wrap text to the card body width, then indent and color each line. */
export function wrappedIndented(text: string, pad: number, width: number, color: (s: string) => string): string[] {
	const inner = Math.max(1, width - pad);
	const lines: string[] = [];
	for (const rawLine of text.split("\n")) {
		const wrapped = rawLine === "" ? [""] : wrapTextWithAnsi(rawLine, inner);
		for (const line of wrapped) {
			lines.push(" ".repeat(pad) + (line === "" ? "" : color(line)));
		}
	}
	return lines;
}
