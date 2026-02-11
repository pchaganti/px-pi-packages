import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
	CONFIG_FILENAME,
	DEFAULT_CONFIG_FILE,
	ensureDefaultConfigFile,
	normalizeHeaders,
	normalizeNumber,
	normalizeTools,
	parseTimeoutMs,
	resolveEffectiveLimits,
	splitParams,
} from "../extensions/index.js";

describe("pi-firecrawl helpers", () => {
	it("normalizes tools from string and array", () => {
		expect(normalizeTools("firecrawl_scrape, , firecrawl_map")).toEqual(["firecrawl_scrape", "firecrawl_map"]);
		expect(normalizeTools([" firecrawl_scrape ", "", 123])).toEqual(["firecrawl_scrape"]);
		expect(normalizeTools("")).toBeUndefined();
		expect(normalizeTools([])).toBeUndefined();
		expect(normalizeTools(42)).toBeUndefined();
	});

	it("normalizes headers", () => {
		expect(normalizeHeaders({ Authorization: "Bearer x", count: 2 })).toEqual({ Authorization: "Bearer x" });
		expect(normalizeHeaders("nope")).toBeUndefined();
		expect(normalizeHeaders({})).toBeUndefined();
	});

	it("normalizes numbers", () => {
		expect(normalizeNumber(42)).toBe(42);
		expect(normalizeNumber("100")).toBe(100);
		expect(normalizeNumber("abc")).toBeUndefined();
		expect(normalizeNumber(undefined)).toBeUndefined();
		expect(normalizeNumber(Number.NaN)).toBeUndefined();
	});

	it("splits params and clamps limits", () => {
		const { apiArgs, requestedLimits } = splitParams({
			piMaxBytes: "100",
			piMaxLines: 5,
			url: "https://a.com",
		});
		expect(apiArgs).toEqual({ url: "https://a.com" });
		expect(requestedLimits).toEqual({ maxBytes: 100, maxLines: 5 });

		const effective = resolveEffectiveLimits({ maxBytes: 200, maxLines: 2 }, { maxBytes: 120, maxLines: 10 });
		expect(effective).toEqual({ maxBytes: 120, maxLines: 2 });
	});

	it("parses timeout", () => {
		expect(parseTimeoutMs("250", 10)).toBe(250);
		expect(parseTimeoutMs("0", 10)).toBe(10);
		expect(parseTimeoutMs(undefined, 30000)).toBe(30000);
		expect(parseTimeoutMs("abc", 5000)).toBe(5000);
		expect(parseTimeoutMs(100, 10)).toBe(100);
	});

	it("writes default config when none exists", () => {
		const base = mkdtempSync(join(tmpdir(), "pi-firecrawl-config-"));
		const projectConfigPath = join(base, "project", ".pi", "extensions", CONFIG_FILENAME);
		const globalConfigPath = join(base, "global", "extensions", CONFIG_FILENAME);

		ensureDefaultConfigFile(projectConfigPath, globalConfigPath);

		expect(existsSync(globalConfigPath)).toBe(true);
		const raw = readFileSync(globalConfigPath, "utf-8");
		expect(JSON.parse(raw)).toEqual(DEFAULT_CONFIG_FILE);
	});

	it("does not overwrite existing config", () => {
		const base = mkdtempSync(join(tmpdir(), "pi-firecrawl-config-"));
		const projectConfigPath = join(base, "project", ".pi", "extensions", CONFIG_FILENAME);
		const globalConfigPath = join(base, "global", "extensions", CONFIG_FILENAME);

		// First call creates it
		ensureDefaultConfigFile(projectConfigPath, globalConfigPath);
		const firstContent = readFileSync(globalConfigPath, "utf-8");

		// Second call should not overwrite
		ensureDefaultConfigFile(projectConfigPath, globalConfigPath);
		const secondContent = readFileSync(globalConfigPath, "utf-8");

		expect(firstContent).toBe(secondContent);
	});
});
