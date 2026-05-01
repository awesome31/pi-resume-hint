import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const DISABLE_ENV = "PI_RESUME_HINT_DISABLE";

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function disabledByEnv(): boolean {
  const value = process.env[DISABLE_ENV]?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function buildHint(cwd: string, sessionId: string, sessionFile?: string): string {
  const lines = [
    "",
    "╭─ Pi session saved",
    "│ Resume this session with:",
    `│   pi --session ${sessionId}`,
    "│",
    "│ From any directory, use:",
    `│   cd ${shellQuote(cwd)} && pi --session ${sessionId}`,
  ];

  if (sessionFile) {
    lines.push("│", `│ Session file: ${sessionFile}`);
  }

  lines.push("╰────────────────────", "");
  return `${lines.join("\n")}\n`;
}

export default function resumeHint(pi: ExtensionAPI) {
  pi.registerCommand("resume-hint", {
    description: "Show the command that resumes the current Pi session",
    handler: async (_args, ctx) => {
      const sessionId = ctx.sessionManager.getSessionId();
      if (!sessionId) {
        ctx.ui.notify("No persisted Pi session is active.", "warning");
        return;
      }

      const hint = buildHint(ctx.cwd, sessionId, ctx.sessionManager.getSessionFile());
      if (ctx.hasUI) {
        ctx.ui.notify(hint.trim(), "info");
      } else {
        process.stdout.write(hint);
      }
    },
  });

  pi.on("session_shutdown", async (event, ctx) => {
    if (event.reason !== "quit" || disabledByEnv()) return;

    const sessionId = ctx.sessionManager.getSessionId();
    if (!sessionId) return;

    process.stderr.write(buildHint(ctx.cwd, sessionId, ctx.sessionManager.getSessionFile()));
  });
}
