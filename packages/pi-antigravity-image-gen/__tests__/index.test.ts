import type { ExtensionAPI, ExtensionContext, SessionStartEvent } from "@earendil-works/pi-coding-agent";
import { afterEach, describe, expect, it, vi } from "vitest";
import antigravityImageGen, { DEPRECATION_MESSAGE } from "../extensions/index.js";

type SessionStartHandler = (event: SessionStartEvent, ctx: ExtensionContext) => void;

const createMockPi = () =>
	({
		on: vi.fn(),
		registerTool: vi.fn(),
	}) satisfies Partial<ExtensionAPI>;

const createMockContext = (hasUI: boolean) =>
	({
		hasUI,
		ui: { notify: vi.fn() },
	}) as unknown as ExtensionContext;

const sessionStartEvent: SessionStartEvent = { type: "session_start", reason: "startup" };

const getSessionStartHandler = (mockPi: ReturnType<typeof createMockPi>): SessionStartHandler => {
	const call = mockPi.on.mock.calls.find(([event]) => event === "session_start");
	expect(call).toBeDefined();
	return call?.[1] as SessionStartHandler;
};

describe("pi-antigravity-image-gen", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("registers no tools and defers the warning to session_start", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const mockPi = createMockPi();
		antigravityImageGen(mockPi as unknown as ExtensionAPI);

		expect(mockPi.registerTool).not.toHaveBeenCalled();
		expect(mockPi.on).toHaveBeenCalledWith("session_start", expect.any(Function));
		expect(warn).not.toHaveBeenCalled();
	});

	it("notifies via the UI when one is available", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const mockPi = createMockPi();
		antigravityImageGen(mockPi as unknown as ExtensionAPI);

		const ctx = createMockContext(true);
		getSessionStartHandler(mockPi)(sessionStartEvent, ctx);

		expect(ctx.ui.notify).toHaveBeenCalledWith(DEPRECATION_MESSAGE, "warning");
		expect(warn).not.toHaveBeenCalled();
	});

	it("falls back to console.warn without a UI", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const mockPi = createMockPi();
		antigravityImageGen(mockPi as unknown as ExtensionAPI);

		const ctx = createMockContext(false);
		getSessionStartHandler(mockPi)(sessionStartEvent, ctx);

		expect(warn).toHaveBeenCalledWith(DEPRECATION_MESSAGE);
		expect(ctx.ui.notify).not.toHaveBeenCalled();
	});

	it("warns only once across repeated session_start events", () => {
		vi.spyOn(console, "warn").mockImplementation(() => {});
		const mockPi = createMockPi();
		antigravityImageGen(mockPi as unknown as ExtensionAPI);

		const handler = getSessionStartHandler(mockPi);
		const ctx = createMockContext(true);
		handler(sessionStartEvent, ctx);
		handler({ type: "session_start", reason: "new" }, ctx);

		expect(ctx.ui.notify).toHaveBeenCalledTimes(1);
	});
});
