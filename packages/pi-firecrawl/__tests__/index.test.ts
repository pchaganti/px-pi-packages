import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { describe, expect, it, vi } from "vitest";
import piFirecrawl, { CONFIG_FILENAME } from "../extensions/index.js";

const createMockPi = () =>
	({
		registerFlag: vi.fn(),
		getFlag: vi.fn(() => undefined),
		registerTool: vi.fn(),
	}) satisfies Partial<ExtensionAPI>;

describe("pi-firecrawl", () => {
	it("registers tools", () => {
		const previousTools = process.env.FIRECRAWL_TOOLS;
		process.env.FIRECRAWL_TOOLS = "";

		const mockPi = createMockPi();
		piFirecrawl(mockPi as unknown as ExtensionAPI);

		if (previousTools === undefined) {
			delete process.env.FIRECRAWL_TOOLS;
		} else {
			process.env.FIRECRAWL_TOOLS = previousTools;
		}

		const toolNames = mockPi.registerTool.mock.calls.map(([tool]) => tool.name);
		expect(toolNames).toEqual(["firecrawl_scrape", "firecrawl_map", "firecrawl_search"]);
	});

	it("honors FIRECRAWL_TOOLS filtering", () => {
		const previousTools = process.env.FIRECRAWL_TOOLS;
		process.env.FIRECRAWL_TOOLS = "firecrawl_scrape,firecrawl_map";

		const mockPi = createMockPi();
		piFirecrawl(mockPi as unknown as ExtensionAPI);

		if (previousTools === undefined) {
			delete process.env.FIRECRAWL_TOOLS;
		} else {
			process.env.FIRECRAWL_TOOLS = previousTools;
		}

		const toolNames = mockPi.registerTool.mock.calls.map(([tool]) => tool.name);
		expect(toolNames).toEqual(["firecrawl_scrape", "firecrawl_map"]);
	});

	it("registers flags", () => {
		const previousTools = process.env.FIRECRAWL_TOOLS;
		process.env.FIRECRAWL_TOOLS = "";

		const mockPi = createMockPi();
		piFirecrawl(mockPi as unknown as ExtensionAPI);

		if (previousTools === undefined) {
			delete process.env.FIRECRAWL_TOOLS;
		} else {
			process.env.FIRECRAWL_TOOLS = previousTools;
		}

		const flagNames = mockPi.registerFlag.mock.calls.map(([name]) => name);
		expect(flagNames).toEqual(
			expect.arrayContaining([
				"firecrawl-url",
				"firecrawl-api-key",
				"firecrawl-timeout-ms",
				"firecrawl-config",
				"firecrawl-tools",
				"firecrawl-max-bytes",
				"firecrawl-max-lines",
			]),
		);
		expect(flagNames.every((name) => !name.startsWith("--"))).toBe(true);
	});

	it("routes invalid-config warnings through ctx.ui.notify when UI is attached", async () => {
		const previousTools = process.env.FIRECRAWL_TOOLS;
		process.env.FIRECRAWL_TOOLS = "";

		const base = mkdtempSync(join(tmpdir(), "pi-firecrawl-invalid-"));
		const configPath = join(base, CONFIG_FILENAME);
		writeFileSync(configPath, "{ not json", "utf-8");

		const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
		const fetchSpy = vi
			.spyOn(globalThis, "fetch")
			.mockResolvedValue(new Response(JSON.stringify({ success: true, data: "ok" }), { status: 200 }));

		try {
			const mockPi = {
				registerFlag: vi.fn(),
				getFlag: vi.fn((name: string) => (name === "firecrawl-config" ? configPath : undefined)),
				registerTool: vi.fn(),
			} satisfies Partial<ExtensionAPI>;
			piFirecrawl(mockPi as unknown as ExtensionAPI);

			// Activation has no extension context in scope, so it still warns on the console.
			expect(warnSpy).toHaveBeenCalledTimes(1);

			const scrape = mockPi.registerTool.mock.calls
				.map(([tool]) => tool)
				.find((tool) => tool.name === "firecrawl_scrape");
			const notify = vi.fn();
			const ctx = { hasUI: true, ui: { notify } } as unknown as ExtensionContext;
			await scrape?.execute("call-1", { url: "https://example.com" }, undefined, undefined, ctx);

			expect(notify).toHaveBeenCalledWith(
				expect.stringContaining(`Invalid Firecrawl config at ${configPath}`),
				"warning",
			);
			expect(warnSpy).toHaveBeenCalledTimes(1);
		} finally {
			warnSpy.mockRestore();
			fetchSpy.mockRestore();
			if (previousTools === undefined) {
				delete process.env.FIRECRAWL_TOOLS;
			} else {
				process.env.FIRECRAWL_TOOLS = previousTools;
			}
		}
	});
});
