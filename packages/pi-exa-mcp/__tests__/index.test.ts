import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import exaMcp from "../extensions/index.js";

// Point the config flag at a temp path so registration-time loadConfig never
// touches (or writes into) the real ~/.pi directory.
let configPath: string;

const createMockPi = () =>
	({
		registerFlag: vi.fn(),
		getFlag: vi.fn((name: string) => (name === "exa-mcp-config" ? configPath : undefined)),
		registerTool: vi.fn(),
	}) satisfies Partial<ExtensionAPI>;

describe("pi-exa-mcp", () => {
	let configDir: string;

	beforeEach(() => {
		configDir = mkdtempSync(join(tmpdir(), "pi-exa-mcp-test-"));
		configPath = join(configDir, "exa-mcp.json");
	});

	afterEach(() => {
		rmSync(configDir, { recursive: true, force: true });
	});

	it("registers tools", () => {
		const mockPi = createMockPi();
		exaMcp(mockPi as unknown as ExtensionAPI);

		const toolNames = mockPi.registerTool.mock.calls.map(([tool]) => tool.name);
		expect(toolNames).toEqual(expect.arrayContaining(["web_search_exa", "get_code_context_exa"]));
		// Registration must not write a default config when an explicit config path is set.
		expect(existsSync(configPath)).toBe(false);
	});

	it("registers flags", () => {
		const mockPi = createMockPi();
		exaMcp(mockPi as unknown as ExtensionAPI);

		const flagNames = mockPi.registerFlag.mock.calls.map(([name]) => name);
		expect(flagNames).toEqual(
			expect.arrayContaining([
				"exa-mcp-url",
				"exa-mcp-tools",
				"exa-mcp-api-key",
				"exa-mcp-timeout-ms",
				"exa-mcp-protocol",
				"exa-mcp-config",
				"exa-mcp-max-bytes",
				"exa-mcp-max-lines",
			]),
		);
		expect(flagNames.every((name) => !name.startsWith("--"))).toBe(true);
	});
});
