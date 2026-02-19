/**
 * Quota API fetching and display helpers for the Synthetic provider.
 */

import { SYNTHETIC_QUOTAS_ENDPOINT } from "./config.js";
import type { SyntheticQuotaResponse } from "./types.js";

/**
 * Fetch quota information from the Synthetic API.
 * Requires an API key (returns null if not provided).
 */
export async function fetchSyntheticQuota(apiKey: string): Promise<SyntheticQuotaResponse> {
	const response = await fetch(SYNTHETIC_QUOTAS_ENDPOINT, {
		headers: {
			Authorization: `Bearer ${apiKey}`,
			Accept: "application/json",
		},
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`Quota API error: ${response.status} ${response.statusText} - ${errorText}`);
	}

	return (await response.json()) as SyntheticQuotaResponse;
}

/**
 * Format a time remaining string from a renewal date.
 * Returns e.g. "2h 14m", "45m", "< 1m"
 */
export function formatTimeRemaining(renewsAt: string): string {
	const now = Date.now();
	const renewalTime = new Date(renewsAt).getTime();
	const diffMs = renewalTime - now;

	if (diffMs <= 0) return "now";

	const totalMinutes = Math.floor(diffMs / 60_000);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours > 0) return `${hours}h ${minutes}m`;
	if (minutes > 0) return `${minutes}m`;
	return "< 1m";
}

/**
 * Build a text-based progress bar.
 * @param used - number of requests used
 * @param limit - maximum requests allowed
 * @param barWidth - character width of the bar (excluding brackets)
 */
export function buildProgressBar(used: number, limit: number, barWidth: number): { bar: string; percent: number } {
	const percent = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
	const filled = Math.round((percent / 100) * barWidth);
	const empty = barWidth - filled;
	const bar = `${"█".repeat(filled)}${"░".repeat(empty)}`;
	return { bar, percent };
}

/**
 * Determine a color name based on usage percentage.
 */
export function getUsageColor(percent: number): "success" | "warning" | "error" {
	if (percent < 60) return "success";
	if (percent < 85) return "warning";
	return "error";
}
