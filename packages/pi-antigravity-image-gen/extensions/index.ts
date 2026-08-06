import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";

const DEPRECATION_MESSAGE =
	"[pi-antigravity-image-gen] Deprecated and disabled: Google has started banning accounts that use third-party Antigravity harnesses. This package no longer registers image-generation tools.";

export default function antigravityImageGen(pi: ExtensionAPI) {
	// Deferred to session_start: fullscreen TUI mode clears the terminal after
	// extensions load, so load-time console output would never be seen. The UI is
	// started before session_start handlers run.
	let warned = false;
	pi.on("session_start", (_event, ctx) => {
		if (warned) return;
		warned = true;
		if (ctx.hasUI) {
			ctx.ui.notify(DEPRECATION_MESSAGE, "warning");
		} else {
			console.warn(DEPRECATION_MESSAGE);
		}
	});
}

export { DEPRECATION_MESSAGE };
