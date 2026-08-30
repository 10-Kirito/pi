import { beforeAll, describe, expect, it } from "vitest";
import { AssistantMessageComponent } from "../src/modes/interactive/components/assistant-message.ts";
import { initTheme } from "../src/modes/interactive/theme/theme.ts";

beforeAll(() => {
	initTheme("dark");
});

describe("AssistantMessageComponent collapsed thinking", () => {
	it("shows the latest thinking block as a one-line preview when collapsed", () => {
		const component = new AssistantMessageComponent(
			{
				role: "assistant",
				content: [
					{ type: "thinking", thinking: "第一块思考\n这是第一块的最后一行" },
					{ type: "thinking", thinking: "第二块思考：定位到 token 刷新逻辑" },
				],
				stopReason: "end",
			} as any,
			true,
		);

		const joined = component.render(80).join("\n");
		expect(joined).toContain("定位到 token 刷新逻辑");
		expect(joined).not.toContain("这是第一块的最后一行");
	});

	it("does not render the static label when there is thinking content", () => {
		const component = new AssistantMessageComponent(
			{
				role: "assistant",
				content: [{ type: "thinking", thinking: "正在分析登录超时原因" }],
				stopReason: "end",
			} as any,
			true,
			undefined,
			"Thinking...",
		);

		const joined = component.render(80).join("\n");
		expect(joined).toContain("正在分析登录超时原因");
		expect(joined).not.toContain("Thinking...");
	});

	it("shows a progress bar while streaming when a token budget is known", () => {
		const component = new AssistantMessageComponent(undefined, true, undefined, undefined, 1, [], 1024);
		component.updateContent(
			{
				role: "assistant",
				content: [{ type: "thinking", thinking: "a".repeat(400) }],
				stopReason: "end",
			} as any,
			true,
		);

		const joined = component.render(80).join("\n");
		expect(joined).toContain("%");
		expect(joined).toContain("█");
	});
});
