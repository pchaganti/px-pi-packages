/**
 * Pure formatting and display utility functions.
 * No side effects — easy to test in isolation.
 */

import type { SyntheticModel } from "./types.js";

// =============================================================================
// Price & Token Formatting
// =============================================================================

/**
 * Parse pricing string to cost per million tokens.
 *
 * The Synthetic API returns pricing in two formats:
 * - Per-token: "$0.00000055" (most models) → multiply by 1M to get $/M
 * - Per-million: "$1.20" (e.g., Kimi-K2.5) → already in $/M format
 *
 * Heuristic: if the numeric value is < 0.001, it's per-token pricing.
 * Values >= 0.001 are already per-million.
 */
export function parsePrice(price?: string): number {
	if (!price) return 0;
	const match = price.match(/[\d.]+/);
	if (!match) return 0;
	const value = parseFloat(match[0]);
	// Per-token values are tiny (e.g., 0.00000055); per-million values are >= 0.001
	return value < 0.001 ? value * 1_000_000 : value;
}

export function formatPrice(price?: string): string {
	return `$${parsePrice(price).toFixed(2)}`;
}

export function formatContextTokens(tokens?: number): string {
	if (!tokens || tokens <= 0) return "n/a";
	return `${Math.round(tokens / 1024)}K`;
}

export function formatTokenCount(tokens?: number): string {
	if (!tokens || tokens <= 0) return "n/a";
	return `${tokens.toLocaleString()} tokens`;
}

export function truncateWithEllipsis(text: string, maxWidth: number): string {
	if (maxWidth <= 0) return "";
	if (text.length <= maxWidth) return text;
	if (maxWidth === 1) return "…";
	return `${text.slice(0, maxWidth - 1)}…`;
}

// =============================================================================
// Region / Datacenter Formatting
// =============================================================================

const REGION_DISPLAY_NAMES = (() => {
	try {
		return new Intl.DisplayNames(["en"], { type: "region" });
	} catch {
		return undefined;
	}
})();

export function formatCountryCode(countryCode: string): string {
	const code = countryCode.trim().toUpperCase();
	if (!code) return "";
	const name = REGION_DISPLAY_NAMES?.of(code);
	if (!name || name === code) return code;
	return `${name} (${code})`;
}

export function formatDatacenters(datacenters?: { country_code: string }[]): string {
	if (!datacenters || datacenters.length === 0) return "n/a";
	const names = datacenters.map((dc) => formatCountryCode(dc.country_code)).filter((name) => name.length > 0);
	return names.length > 0 ? names.join(", ") : "n/a";
}

// =============================================================================
// Model Capabilities & Sorting
// =============================================================================

export function getModelCapabilities(model: SyntheticModel): string[] {
	const caps: string[] = [];
	if (model.input_modalities?.includes("image")) caps.push("vision");
	if (model.supported_features?.includes("reasoning")) caps.push("reason");
	if (model.supported_features?.includes("tools")) caps.push("tools");
	return caps;
}

export function getProviderSortRank(provider?: string): number {
	return provider === "synthetic" ? 0 : 1;
}

// =============================================================================
// Catalog Table Formatting
// =============================================================================

const CATALOG_PROVIDER_COL = 10;
const CATALOG_MODEL_COL = 34;
const CATALOG_CTX_COL = 5;
const CATALOG_PRICE_COL = 7;
const CATALOG_CAPS_COL = 18;

export function formatCatalogHeader(): string {
	const provider = "Provider".padEnd(CATALOG_PROVIDER_COL);
	const model = "Model".padEnd(CATALOG_MODEL_COL);
	const ctx = "Ctx".padStart(CATALOG_CTX_COL);
	const input = "In".padStart(CATALOG_PRICE_COL);
	const output = "Out".padStart(CATALOG_PRICE_COL);
	const cache = "R-Cache".padStart(CATALOG_PRICE_COL);
	const caps = "Caps".padEnd(CATALOG_CAPS_COL);
	return `${provider} ${model} ${ctx} ${input} ${output} ${cache} ${caps}`;
}

export function formatCatalogRow(model: SyntheticModel): string {
	const providerRaw = model.provider || "unknown";
	const provider = truncateWithEllipsis(providerRaw, CATALOG_PROVIDER_COL).padEnd(CATALOG_PROVIDER_COL);
	const modelId = truncateWithEllipsis(model.id, CATALOG_MODEL_COL).padEnd(CATALOG_MODEL_COL);
	const ctx = formatContextTokens(model.context_length).padStart(CATALOG_CTX_COL);
	const input = formatPrice(model.pricing?.prompt).padStart(CATALOG_PRICE_COL);
	const output = formatPrice(model.pricing?.completion).padStart(CATALOG_PRICE_COL);
	const cache = formatPrice(model.pricing?.input_cache_reads).padStart(CATALOG_PRICE_COL);
	const capsRaw = getModelCapabilities(model).join("/") || "-";
	const caps = truncateWithEllipsis(capsRaw, CATALOG_CAPS_COL).padEnd(CATALOG_CAPS_COL);
	return `${provider} ${modelId} ${ctx} ${input} ${output} ${cache} ${caps}`;
}
