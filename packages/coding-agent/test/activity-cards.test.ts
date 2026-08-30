import { Text, type TUI } from "@earendil-works/pi-tui";
import { Type } from "typebox";
import { beforeAll, describe, expect, test } from "vitest";
import type { ToolDefinition } from "../src/core/extensions/types.ts";
import { ThinkingCard } from "../src/modes/interactive/components/thinking-card.ts";
import { ToolCallsCard } from "../src/modes/interactive/components/tool-calls-card.ts";
import { ToolExecutionComponent } from "../src/modes/interactive/components/tool-execution.ts";
import { initTheme } from "../src/modes/interactive/theme/theme.ts";
import { stripAnsi } from "../src/utils/ansi.ts";

beforeAll(() => {
	initTheme("dark");
});

function fakeTui(): TUI {
	return { requestRender: () => {} } as unknown as TUI;
}

function makeTool(name: string, id: string): ToolExecutionComponent {
	const definition: ToolDefinition = {
		name,
		label: name,
		description: "test tool",
		parameters: Type.Any(),
		execute: async () => ({ content: [{ type: "text", text: "ok" }], details: {} }),
		renderCall: () => new Text(name, 0, 0),
		renderResult: () => new Text(`${name} result`, 0, 0),
	};
	return new ToolExecutionComponent(name, id, {}, {}, definition, fakeTui(), process.cwd());
}

describe("ThinkingCard", () => {
	test("renders nothing when empty", () => {
		const card = new ThinkingCard();
		expect(card.render(80)).toEqual([]);
	});

	test("streaming collapsed shows last 3 lines plus progress", () => {
		const card = new ThinkingCard(false, 1024);
		card.update(["line1\nline2\nline3\nline4\nline5"], true);
		const out = stripAnsi(card.render(80).join("\n"));
		expect(out).toContain("line3");
		expect(out).toContain("line4");
		expect(out).toContain("line5");
		expect(out).not.toContain("line1");
		expect(out).not.toContain("line2");
		expect(out).toContain("tokens");
		expect(out).toMatch(/\d+\.\d+s/);
	});

	test("collapsed header shows fold indicator and title", () => {
		const card = new ThinkingCard();
		card.update(["block"], false);
		const out = stripAnsi(card.render(80).join("\n"));
		expect(out).toContain("▸");
		expect(out).toContain("思考");
		expect(out).toContain("展开");
	});

	test("expanded header flips the fold indicator", () => {
		const card = new ThinkingCard();
		card.update(["block"], false);
		card.setThinkingExpanded(true);
		const out = stripAnsi(card.render(80).join("\n"));
		expect(out).toContain("▾");
		expect(out).toContain("折叠");
	});

	test("streaming collapsed notes completed blocks", () => {
		const card = new ThinkingCard();
		card.update(["done block", "current block\nline"], true);
		const out = stripAnsi(card.render(80).join("\n"));
		expect(out).toContain("已折叠");
		expect(out).toContain("line");
	});

	test("settled collapsed shows a single summary line", () => {
		const card = new ThinkingCard();
		card.update(["first block\nlast line of first", "second block\nfinal thought"], false);
		const out = stripAnsi(card.render(80).join("\n"));
		expect(out).toContain("final thought");
		expect(out).not.toContain("first block");
		expect(out).toContain("2 块");
	});

	test("expanded shows all blocks", () => {
		const card = new ThinkingCard();
		card.update(["block one", "block two"], false);
		card.setThinkingExpanded(true);
		const out = stripAnsi(card.render(80).join("\n"));
		expect(out).toContain("block one");
		expect(out).toContain("block two");
	});
});

describe("ToolCallsCard", () => {
	test("renders nothing when empty", () => {
		const card = new ToolCallsCard();
		expect(card.render(80)).toEqual([]);
	});

	test("collapsed folds done tools and keeps the running tool full", () => {
		const card = new ToolCallsCard();
		const done1 = makeTool("read", "t1");
		done1.markExecutionStarted();
		done1.updateResult({ content: [{ type: "text", text: "r" }], isError: false }, false);
		const done2 = makeTool("grep", "t2");
		done2.markExecutionStarted();
		done2.updateResult({ content: [{ type: "text", text: "g" }], isError: false }, false);
		const running = makeTool("bash", "t3");
		running.markExecutionStarted();

		card.addTool(done1);
		card.addTool(done2);
		card.addTool(running);

		const out = stripAnsi(card.render(120).join("\n"));
		expect(out).toContain("工具调用 (3)");
		expect(out).toContain("▸");
		expect(out).toContain("✓ read");
		expect(out).toContain("✓ grep");
		expect(out).toContain("bash");
		expect(out).not.toContain("✓ bash");
	});

	test("collapsed caps completed summaries with a more hint", () => {
		const card = new ToolCallsCard();
		for (let i = 0; i < 5; i++) {
			const tool = makeTool(`tool${i}`, `id${i}`);
			tool.markExecutionStarted();
			tool.updateResult({ content: [{ type: "text", text: "x" }], isError: false }, false);
			card.addTool(tool);
		}
		const out = stripAnsi(card.render(120).join("\n"));
		expect(out).toContain("工具调用 (5)");
		expect(out).toContain("2 more");
		expect(out).toContain("✓ tool2");
		expect(out).toContain("✓ tool4");
		expect(out).not.toContain("✓ tool0");
		expect(out).not.toContain("✓ tool1");
	});

	test("expanded shows all tools unfolded", () => {
		const card = new ToolCallsCard();
		const tool = makeTool("read", "t1");
		tool.markExecutionStarted();
		tool.updateResult({ content: [{ type: "text", text: "r" }], isError: false }, false);
		card.addTool(tool);
		card.setExpanded(true);
		const out = stripAnsi(card.render(120).join("\n"));
		expect(out).toContain("▾");
		expect(out).toContain("折叠");
		expect(out).toContain("read result");
	});
});
