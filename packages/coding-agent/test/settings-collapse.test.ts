import { describe, expect, it } from "vitest";
import { SettingsManager, type SettingsStorage } from "../src/core/settings-manager.ts";

function makeStorage(globalJson?: string): SettingsStorage {
	return {
		withLock(scope, fn) {
			fn(scope === "global" ? globalJson : undefined);
		},
	};
}

describe("collapse settings", () => {
	it("thinkingByDefault defaults to true", () => {
		const sm = SettingsManager.fromStorage(makeStorage());
		expect(sm.getCollapseThinkingByDefault()).toBe(true);
	});

	it("getHideThinkingBlock falls back to thinkingByDefault when unset", () => {
		const sm = SettingsManager.fromStorage(makeStorage());
		expect(sm.getHideThinkingBlock()).toBe(true);
	});

	it("explicit hideThinkingBlock overrides the collapse default", () => {
		const sm = SettingsManager.fromStorage(makeStorage('{"hideThinkingBlock": false}'));
		expect(sm.getHideThinkingBlock()).toBe(false);
	});

	it("collapse.thinkingByDefault false disables default collapse", () => {
		const sm = SettingsManager.fromStorage(makeStorage('{"collapse": {"thinkingByDefault": false}}'));
		expect(sm.getCollapseThinkingByDefault()).toBe(false);
		expect(sm.getHideThinkingBlock()).toBe(false);
	});

	it("autoCollapseOnTurnEnd defaults to true", () => {
		const sm = SettingsManager.fromStorage(makeStorage());
		expect(sm.getCollapseAutoCollapseOnTurnEnd()).toBe(true);
	});
});
