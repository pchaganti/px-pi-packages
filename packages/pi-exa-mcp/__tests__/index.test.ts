import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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

	it("seeds the default config under PI_CODING_AGENT_DIR when no config path is set", () => {
		const homeDir = join(configDir, "home");
		const agentDir = join(configDir, "agent");
		const projectDir = join(configDir, "project");
		mkdirSync(projectDir, { recursive: true });
		vi.stubEnv("HOME", homeDir);
		vi.stubEnv("PI_CODING_AGENT_DIR", agentDir);
		vi.stubEnv("EXA_MCP_CONFIG", "");
		const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(projectDir);
		const homeConfigPath = join(homeDir, ".pi", "agent", "extensions", "exa-mcp.json");
		try {
			const mockPi = createMockPi();
			mockPi.getFlag.mockReturnValue(undefined);
			exaMcp(mockPi as unknown as ExtensionAPI);

			const seededPath = join(agentDir, "extensions", "exa-mcp.json");
			expect(existsSync(seededPath)).toBe(true);
			// The relocated agent dir must fully replace the home-based default.
			expect(existsSync(homeConfigPath)).toBe(false);
		} finally {
			cwdSpy.mockRestore();
			vi.unstubAllEnvs();
		}
	});

	it("honors a legacy home config when PI_CODING_AGENT_DIR is set and the relocated dir has none", () => {
		const homeDir = join(configDir, "home");
		const agentDir = join(configDir, "agent");
		const projectDir = join(configDir, "project");
		mkdirSync(projectDir, { recursive: true });
		const legacyConfigPath = join(homeDir, ".pi", "agent", "extensions", "exa-mcp.json");
		mkdirSync(join(homeDir, ".pi", "agent", "extensions"), { recursive: true });
		writeFileSync(legacyConfigPath, `${JSON.stringify({ tools: ["web_search_exa"] })}\n`, "utf-8");
		vi.stubEnv("HOME", homeDir);
		vi.stubEnv("PI_CODING_AGENT_DIR", agentDir);
		vi.stubEnv("EXA_MCP_CONFIG", "");
		const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(projectDir);
		try {
			const mockPi = createMockPi();
			mockPi.getFlag.mockReturnValue(undefined);
			exaMcp(mockPi as unknown as ExtensionAPI);

			// The legacy config's tools list must apply: only web_search_exa registers.
			const toolNames = mockPi.registerTool.mock.calls.map(([tool]) => tool.name);
			expect(toolNames).toEqual(["web_search_exa"]);
			// No default may be seeded in the relocated dir — it would shadow the legacy config.
			expect(existsSync(join(agentDir, "extensions", "exa-mcp.json"))).toBe(false);
		} finally {
			cwdSpy.mockRestore();
			vi.unstubAllEnvs();
		}
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
