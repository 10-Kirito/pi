import type { Component } from "@earendil-works/pi-tui";
import { theme } from "../theme/theme.ts";
import { cardRule, wrappedIndented } from "./card-frame.ts";
import { keyText } from "./keybinding-hints.ts";
import { estimateTokens } from "./token-estimate.ts";

/** Number of trailing lines of the live thinking block to preview while streaming. */
const PREVIEW_LINES = 3;
/** Hard cap on the single-line settled summary. */
const SUMMARY_MAX_LEN = 120;

/** Extract the last `n` non-empty lines of a block, trimmed. */
function lastLines(text: string, n: number): string {
	return text
		.split("\n")
		.map((l) => l.trim())
		.filter(Boolean)
		.slice(-n)
		.join("\n");
}

/**
 * Collapsible status card for thinking. Shows the current thinking block live
 * and folds completed thinking into a compact summary, framed as a distinct
 * card with its own expand/collapse state.
 */
export class ThinkingCard implements Component {
	private blocks: string[] = [];
	private isStreaming = false;
	private expanded: boolean;
	private maxThinkingTokens?: number;
	private streamingStartedAt?: number;
	private outputPad: number;
	private label: string;

	constructor(expanded = false, maxThinkingTokens?: number, outputPad = 1, label = "Thinking...") {
		this.expanded = expanded;
		this.maxThinkingTokens = maxThinkingTokens;
		this.outputPad = outputPad;
		this.label = label;
	}

	setThinkingExpanded(expanded: boolean): void {
		this.expanded = expanded;
	}

	setLabel(label: string): void {
		this.label = label;
	}

	setMaxThinkingTokens(tokens: number | undefined): void {
		this.maxThinkingTokens = tokens;
	}

	/** Replace the card content. `blocks` is every non-empty thinking block for the turn. */
	update(blocks: string[], isStreaming: boolean): void {
		this.blocks = blocks;
		if (isStreaming) {
			if (this.streamingStartedAt === undefined) {
				this.streamingStartedAt = Date.now();
			}
		} else {
			this.streamingStartedAt = undefined;
		}
		this.isStreaming = isStreaming;
	}

	hasContent(): boolean {
		return this.blocks.length > 0;
	}

	invalidate(): void {
		// No cached state; rendering is computed on each render().
	}

	render(width: number): string[] {
		if (this.blocks.length === 0) return [];

		const pad = this.outputPad;
		const indent = " ".repeat(pad);
		const lines: string[] = [];
		const fold = this.expanded ? "▾" : "▸";
		const count = this.blocks.length > 1 ? ` · ${this.blocks.length} 块` : "";
		const action = this.expanded ? "折叠" : "展开";
		lines.push(
			indent +
				theme.fg("accent", fold) +
				" " +
				theme.fg("muted", theme.bold("思考")) +
				theme.fg("dim", count) +
				theme.fg("dim", ` (${keyText("app.thinking.toggle")}${action})`),
		);

		if (this.expanded) {
			for (let i = 0; i < this.blocks.length; i++) {
				if (i > 0) {
					lines.push(indent);
				}
				lines.push(
					...wrappedIndented(this.blocks[i], pad, width, (s) => theme.italic(theme.fg("thinkingText", s))),
				);
			}
		} else if (this.isStreaming) {
			const completedCount = this.blocks.length - 1;
			if (completedCount > 0) {
				lines.push(indent + theme.fg("dim", `… ${completedCount} 个思考块已折叠`));
			}
			const current = this.blocks[this.blocks.length - 1] ?? "";
			lines.push(
				...wrappedIndented(lastLines(current, PREVIEW_LINES), pad, width, (s) =>
					theme.italic(theme.fg("thinkingText", s)),
				),
			);
			const estTokens = estimateTokens(this.blocks.join("\n"));
			const elapsedSec =
				this.streamingStartedAt !== undefined ? ((Date.now() - this.streamingStartedAt) / 1000).toFixed(1) : "0.0";
			const budget = this.maxThinkingTokens ? ` / ${this.maxThinkingTokens}` : "";
			lines.push(indent + theme.fg("dim", `· ~${estTokens}${budget} tokens · ${elapsedSec}s`));
		} else {
			const last = this.blocks[this.blocks.length - 1] ?? "";
			const lastLine =
				last
					.split("\n")
					.map((l) => l.trim())
					.filter(Boolean)
					.pop() ?? "";
			const base = lastLine.length > 0 ? lastLine : this.label;
			const label = this.blocks.length > 1 ? `${base} · 共 ${this.blocks.length} 块` : base;
			const display = label.length > SUMMARY_MAX_LEN ? `${label.slice(0, SUMMARY_MAX_LEN - 3)}...` : label;
			lines.push(...wrappedIndented(display, pad, width, (s) => theme.italic(theme.fg("thinkingText", s))));
		}

		lines.push(cardRule(width));
		return lines;
	}
}
