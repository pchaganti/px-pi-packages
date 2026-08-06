import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
	DEFAULT_CONFIG_FILE,
	ensureDefaultConfigFile,
	normalizeTools,
	parseTimeoutMs,
	parseToolsFromUrl,
	resolveEffectiveLimits,
	resolveEndpoint,
	splitParams,
} from "../extensions/index.js";

describe("pi-exa-mcp helpers", () => {
	it("normalizes tools from strings and arrays", () => {
		expect(normalizeTools("web_search_exa, , get_code_context_exa")).toEqual([
			"web_search_exa",
			"get_code_context_exa",
		]);
		expect(normalizeTools([" web_search_exa ", "", 123])).toEqual(["web_search_exa"]);
	});

	it("parses tools from URL", () => {
		const tools = parseToolsFromUrl("https://mcp.exa.ai/mcp?tools=web_search_exa,get_code_context_exa");
		expect(tools).toEqual(["web_search_exa", "get_code_context_exa"]);
	});

	it("splits params and clamps limits", () => {
		const { mcpArgs, requestedLimits } = splitParams({
			piMaxBytes: "100",
			piMaxLines: 5,
			query: "hello",
		});
		expect(mcpArgs).toEqual({ query: "hello" });
		expect(requestedLimits).toEqual({ maxBytes: 100, maxLines: 5 });

		const effective = resolveEffectiveLimits({ maxBytes: 200, maxLines: 2 }, { maxBytes: 120, maxLines: 10 });
		expect(effective).toEqual({ maxBytes: 120, maxLines: 2 });
	});

	it("resolves endpoint with tools and api key", () => {
		const endpoint = resolveEndpoint("https://mcp.exa.ai/mcp", ["a", "b"], "secret");
		const url = new URL(endpoint);
		expect(url.searchParams.get("tools")).toBe("a,b");
		expect(url.searchParams.get("exaApiKey")).toBe("secret");

		const existing = resolveEndpoint("https://mcp.exa.ai/mcp?tools=web_search_exa", ["x"], "secret");
		const existingUrl = new URL(existing);
		expect(existingUrl.searchParams.get("tools")).toBe("web_search_exa");
	});

	it("parses timeout values", () => {
		expect(parseTimeoutMs("250", 10)).toBe(250);
		expect(parseTimeoutMs("0", 10)).toBe(10);
	});

	it("writes default config when none exists", () => {
		const base = mkdtempSync(join(tmpdir(), "pi-exa-config-"));
		const projectConfigPath = join(base, "project", ".pi", "extensions", "exa-mcp.json");
		const globalConfigPath = join(base, "global", "extensions", "exa-mcp.json");

		ensureDefaultConfigFile(projectConfigPath, globalConfigPath);

		expect(existsSync(globalConfigPath)).toBe(true);
		const raw = readFileSync(globalConfigPath, "utf-8");
		expect(JSON.parse(raw)).toEqual(DEFAULT_CONFIG_FILE);
	});

	it("warns once and stops retrying when the default config write fails", () => {
		const base = mkdtempSync(join(tmpdir(), "pi-exa-config-"));
		const projectConfigPath = join(base, "project", ".pi", "extensions", "exa-mcp.json");
		// A regular file in the parent chain makes mkdirSync fail on every attempt.
		const blocker = join(base, "blocked");
		writeFileSync(blocker, "not a directory", "utf-8");
		const globalConfigPath = join(blocker, "extensions", "exa-mcp.json");

		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		try {
			ensureDefaultConfigFile(projectConfigPath, globalConfigPath);
			expect(warnSpy).toHaveBeenCalledTimes(1);
			expect(existsSync(globalConfigPath)).toBe(false);

			// Removing the blocker would let a retry succeed. The latch must prevent the
			// retry entirely, not merely silence the second warning.
			rmSync(blocker);
			ensureDefaultConfigFile(projectConfigPath, globalConfigPath);
			expect(existsSync(globalConfigPath)).toBe(false);
			expect(warnSpy).toHaveBeenCalledTimes(1);
		} finally {
			warnSpy.mockRestore();
		}
	});
});
