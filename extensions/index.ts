import { existsSync } from "node:fs";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const DISABLE_ENV = "PI_RESUME_HINT_DISABLE";

const EXIT_MESSAGES = [
  "Pi parked your brain dump safely.",
  "Session tucked in. Blanket optional.",
  "Your context goblin has been bottled.",
  "Pi saved the breadcrumbs. No pigeons involved.",
  "Session preserved in amber. Tiny dinosaur not included.",
  "The terminal dragon is napping on your session.",
  "Pi put a tiny bookmark in the multiverse.",
  "Your agent adventure is now resumable lore.",
  "Session saved. Future-you owes present-you a snack.",
  "The conversation has been cryogenically frozen.",
  "Pi folded the session into a neat little burrito.",
  "Checkpoint acquired. Side quest may continue later.",
  "The session squirrel buried this one carefully.",
  "Pi bottled the vibes and labeled the cork.",
  "Your tokens have gone to a cozy little cabin.",
  "Session saved. The robots are pretending not to miss you.",
  "Pi left a glowing trail back to this exact chaos.",
  "The context gremlin salutes and stands down.",
  "Session parked. Please validate your parking stub.",
  "Pi saved your place in the code swamp.",
  "The rubber duck has memorized where you stopped.",
  "Session archived by a very serious raccoon.",
  "Pi put this run in a tiny labeled jar.",
  "The code cave remembers your footsteps.",
  "Session saved. Your future self just high-fived you.",
  "Pi dropped a pin on this debugging expedition.",
  "The agent has powered down dramatically.",
  "Session secured behind a suspiciously friendly wizard.",
  "Your work-in-progress got its own little hammock.",
  "Pi saved the plot twist for next time.",
] as const;

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function disabledByEnv(): boolean {
  const value = process.env[DISABLE_ENV]?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function pickExitMessage(): string {
  return EXIT_MESSAGES[Math.floor(Math.random() * EXIT_MESSAGES.length)] ?? "Pi session saved.";
}

function buildHint(cwd: string, sessionId: string, sessionFile: string, exitMessage = pickExitMessage()): string {
  const lines = [
    "",
    `╭─ ${exitMessage}`,
    "│ Resume this session with:",
    `│   pi --session ${sessionId}`,
    "│",
    "│ From any directory, use:",
    `│   cd ${shellQuote(cwd)} && pi --session ${sessionId}`,
  ];

  lines.push("│", `│ Session file: ${sessionFile}`);

  lines.push("╰────────────────────", "");
  return `${lines.join("\n")}\n`;
}

export default function resumeHint(pi: ExtensionAPI) {
  pi.registerCommand("resume-hint", {
    description: "Show the command that resumes the current Pi session",
    handler: async (_args, ctx) => {
      const sessionId = ctx.sessionManager.getSessionId();
      const sessionFile = ctx.sessionManager.getSessionFile();
      if (!sessionId || !sessionFile || !existsSync(sessionFile)) {
        ctx.ui.notify("No persisted Pi session is active.", "warning");
        return;
      }

      const hint = buildHint(ctx.cwd, sessionId, sessionFile);
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
    const sessionFile = ctx.sessionManager.getSessionFile();
    if (!sessionId || !sessionFile || !existsSync(sessionFile)) return;

    process.stderr.write(buildHint(ctx.cwd, sessionId, sessionFile));
  });
}
