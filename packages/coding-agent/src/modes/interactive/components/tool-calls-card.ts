import type { Component } from "@earendil-works/pi-tui";
import { theme } from "../theme/theme.ts";
import { cardRule } from "./card-frame.ts";
import { keyText } from "./keybinding-hints.ts";
import type { ToolExecutionComponent } from "./tool-execution.ts";

/** When collapsed, how many completed tools keep a one-line `✓` summary. */
const MAX_FOLDED_COMPLETED = 3;

/**
 * Collapsible status card that groups a turn's tool calls. The currently
 * running tool stays fully visible; completed tools fold to a one-line summary.
 * Framed as a distinct card with its own expand/collapse state.
 */
export class ToolCallsCard implements Component {
	private tools: ToolExecutionComponent[] = [];
	private expanded: boolean;
	private outputPad: number;

	constructor(expanded = false, outputPad = 1) {
		this.expanded = expanded;
		this.outputPad = outputPad;
	}

	addTool(component: ToolExecutionComponent): void {
		this.tools.push(component);
	}

	getTool(toolCallId: string): ToolExecutionComponent | undefined {
		return this.tools.find((t) => t.getToolCallId() === toolCallId);
	}

	toolCount(): number {
		return this.tools.length;
	}

	hasContent(): boolean {
		return this.tools.length > 0;
	}

	setExpanded(expanded: boolean): void {
		this.expanded = expanded;
		for (const tool of this.tools) {
			tool.setExpanded(expanded);
		}
	}

	invalidate(): void {
		for (const tool of this.tools) {
			tool.invalidate();
		}
	}

	render(width: number): string[] {
		if (this.tools.length === 0) return [];

		const indent = " ".repeat(this.outputPad);
		const done = this.tools.filter((t) => t.isDone());
		const current = this.tools.filter((t) => !t.isDone());

		const lines: string[] = [];
		const fold = this.expanded ? "▾" : "▸";
		const title = theme.fg("muted", theme.bold(`工具调用 (${this.tools.length})`));
		const hint = this.expanded
			? theme.fg("dim", ` (${keyText("app.tools.expand")}折叠)`)
			: theme.fg("dim", ` (${keyText("app.tools.expand")}展开)`);
		lines.push(indent + theme.fg("accent", fold) + " " + title + hint);

		if (this.expanded) {
			for (const tool of this.tools) {
				tool.setFolded(false);
				lines.push(...tool.render(width));
			}
		} else {
			const shown = done.slice(-MAX_FOLDED_COMPLETED);
			const hidden = done.length - shown.length;
			for (const tool of shown) {
				tool.setFolded(true);
				lines.push(...tool.render(width));
			}
			if (hidden > 0) {
				lines.push(indent + theme.fg("dim", `… ${hidden} more`));
			}
			for (const tool of current) {
				tool.setFolded(false);
				lines.push(...tool.render(width));
			}
		}

		lines.push(cardRule(width));
		return lines;
	}
}
