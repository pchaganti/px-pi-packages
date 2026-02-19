/**
 * /synthetic-quota command handler.
 * Displays current API usage quotas and limits in a TUI overlay.
 */

import { DynamicBorder, type ExtensionAPI } from "@mariozechner/pi-coding-agent";
import { Box, Container, Spacer, Text } from "@mariozechner/pi-tui";
import { getSyntheticApiKey } from "../auth.js";
import { buildProgressBar, fetchSyntheticQuota, formatTimeRemaining, getUsageColor } from "../quota.js";
import type { QuotaBucket } from "../types.js";

export function registerSyntheticQuotaCommand(pi: ExtensionAPI): void {
	pi.registerCommand("synthetic-quota", {
		description: "Display your Synthetic API usage quotas and limits",
		handler: async (_args, ctx) => {
			if (!ctx.hasUI) {
				console.log("[Synthetic Provider] /synthetic-quota requires interactive mode");
				return;
			}
			if (!ctx.isIdle()) {
				ctx.ui.notify("Wait for the current response to finish", "warning");
				return;
			}

			const apiKey = await getSyntheticApiKey(ctx);
			if (!apiKey) {
				ctx.ui.notify("Synthetic API key not configured. Set SYNTHETIC_API_KEY or add to auth.json.", "error");
				return;
			}

			ctx.ui.notify("Fetching quota from Synthetic API...", "info");

			try {
				const quota = await fetchSyntheticQuota(apiKey);

				const BAR_WIDTH = 30;
				let overlayRows = 44;
				let overlayCols = 140;

				await ctx.ui.custom<void>(
					(tui, theme, _keybindings, done) => {
						overlayRows = tui.terminal.rows;
						overlayCols = tui.terminal.columns;

						// API has moved tool-call quota from `toolCallDiscounts` to `freeToolCalls`;
						// keep both for backwards compatibility with older payloads.
						const toolCallBucket = quota.toolCallDiscounts ?? quota.freeToolCalls;
						// Count how many sections we'll render to estimate needed height
						const bucketCount = [quota.subscription, toolCallBucket, quota.search?.hourly].filter(Boolean).length;
						// Normal layout: ~7 lines/bucket + 3 separator lines between + 6 chrome
						// Compact layout: ~3 lines/bucket + 1 separator line between + 4 chrome
						const normalHeight = bucketCount * 7 + (bucketCount - 1) * 3 + 6;
						const compact = overlayRows < 45 || normalHeight > overlayRows * 0.75;
						const barWidth = compact ? 20 : BAR_WIDTH;

						const renderBucket = (label: string, bucket: QuotaBucket | undefined, icon: string): string[] => {
							if (!bucket) return [];

							const { bar, percent } = buildProgressBar(bucket.requests, bucket.limit, barWidth);
							const color = getUsageColor(percent);
							const remaining = Math.max(0, bucket.limit - bucket.requests);
							const renewalStr = formatTimeRemaining(bucket.renewsAt);

							if (compact) {
								return [
									`${icon}  ${theme.fg("accent", theme.bold(label))}`,
									`   ${theme.fg(color, bar)}  ${theme.fg(color, `${percent.toFixed(1)}%`)} used`,
									`   ${theme.bold(String(bucket.requests))} / ${bucket.limit} req ${theme.fg("muted", "·")} ${theme.fg(remaining > 0 ? "success" : "error", remaining.toFixed(1))} left ${theme.fg("muted", "·")} resets ${theme.fg("accent", renewalStr)}`,
								];
							}

							return [
								`${icon}  ${theme.fg("accent", theme.bold(label))}`,
								"",
								`   ${theme.fg(color, bar)}  ${theme.fg(color, `${percent.toFixed(1)}%`)} used`,
								"",
								`   ${theme.fg("muted", "Used:")}     ${theme.bold(String(bucket.requests))} / ${bucket.limit} requests`,
								`   ${theme.fg("muted", "Remaining:")} ${theme.fg(remaining > 0 ? "success" : "error", remaining.toFixed(1))} requests`,
								`   ${theme.fg("muted", "Resets in:")} ${theme.fg("accent", renewalStr)}`,
							];
						};

						const sections: string[][] = [];
						sections.push(renderBucket("Subscription", quota.subscription, "⚡"));
						if (toolCallBucket) {
							const toolCallLabel = quota.toolCallDiscounts ? "Tool Call Discounts" : "Free Tool Calls";
							sections.push(renderBucket(toolCallLabel, toolCallBucket, "🔧"));
						}
						if (quota.search?.hourly) {
							sections.push(renderBucket("Search (hourly)", quota.search.hourly, "🔍"));
						}

						const container = new Container();
						container.addChild(new DynamicBorder((s: string) => theme.fg("accent", s)));
						container.addChild(new Text(theme.fg("accent", theme.bold("  Synthetic API Quota")), 1, 0));

						if (!compact) {
							container.addChild(
								new Text(theme.fg("muted", "  Usage and limits for your Synthetic subscription"), 1, 0),
							);
						}

						container.addChild(new DynamicBorder((s: string) => theme.fg("muted", s)));

						if (!compact) {
							container.addChild(new Spacer(1));
						}

						for (let i = 0; i < sections.length; i++) {
							const section = sections[i];
							if (section.length > 0) {
								container.addChild(new Text(section.join("\n"), 1, 0));
								if (i < sections.length - 1) {
									if (!compact) {
										container.addChild(new Spacer(1));
									}
									container.addChild(new DynamicBorder((s: string) => theme.fg("muted", s)));
								}
							}
						}

						if (!compact) {
							container.addChild(new Spacer(1));
						}
						container.addChild(new DynamicBorder((s: string) => theme.fg("muted", s)));
						container.addChild(new Text(theme.fg("dim", "  Esc / Enter to close"), 1, 0));
						container.addChild(new DynamicBorder((s: string) => theme.fg("accent", s)));

						const panel = new Box(0, 0, (s: string) => theme.bg("customMessageBg", s));
						panel.addChild(container);

						return {
							render: (width) => panel.render(width),
							invalidate: () => panel.invalidate(),
							handleInput: (data) => {
								if (data === "\x1b" || data === "\r" || data === "\n") {
									done(undefined);
								}
							},
						};
					},
					{
						overlay: true,
						overlayOptions: () => {
							const width = overlayCols < 100 ? "98%" : "70%";

							if (overlayRows < 30) {
								return {
									width: "100%",
									maxWidth: 80,
									minWidth: 50,
									maxHeight: "94%",
									anchor: "center" as const,
									margin: 0,
								};
							}

							if (overlayRows < 40) {
								return {
									width,
									maxWidth: 80,
									minWidth: 50,
									maxHeight: "88%",
									anchor: "top-center" as const,
									offsetY: 2,
									margin: 1,
								};
							}

							return {
								width,
								maxWidth: 80,
								minWidth: 50,
								maxHeight: "80%",
								anchor: "top-center" as const,
								offsetY: 4,
								margin: 1,
							};
						},
					},
				);
			} catch (error) {
				const errorMessage = error instanceof Error ? error.message : String(error);
				ctx.ui.notify(`Failed to fetch quota: ${errorMessage}`, "error");
				console.error("[Synthetic Provider] Quota fetch failed:", error);
			}
		},
	});
}
