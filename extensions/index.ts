import { existsSync } from "node:fs";
import type { ExtensionAPI } from "@mariozechner/pi-coding-agent";

const DISABLE_ENV = "PI_RESUME_HINT_DISABLE";

const EXIT_MESSAGES = [
  "I'll be back... and so will your session:",
  "May the source be with you. Return via:",
  "You shall not pass... without this resume spell:",
  "Here's looking at your stack trace, kid. Resume with:",
  "There's no place like localhost. Tap your heels and run:",
  "E.T. saved your session. Phone home with:",
  "The code abides. Pick it back up with:",
  "Houston, we have a resume command:",
  "Life finds a way... back to this session:",
  "Roads? Where we're going, we need sessions:",
  "The Matrix has you. Re-enter with:",
  "One does not simply quit without saving the command:",
  "Winter is coming, but your context is safe:",
  "The North remembers your tokens. Resume with:",
  "I solemnly swear this session is up to no good:",
  "Mischief managed? Not until you return with:",
  "Yer a resumable session, Harry. Use:",
  "Expecto contextum! Bring it back with:",
  "The force ghost of your code whispers:",
  "This is the way... back:",
  "I have spoken. Resume with:",
  "To boldly go back where you just were:",
  "Make it so. Resume with:",
  "Beam yourself back to this context with:",
  "The One Ring to resume them all:",
  "My precious context is waiting here:",
  "Wakanda forever, sessions forever. Return with:",
  "With great context comes great resumability:",
  "I am Groot. Translation: resume with:",
  "Avengers, reassemble this session with:",
  "The multiverse saved this exact timeline:",
  "A wizard is never late; neither is this command:",
  "It's dangerous to go alone. Take this:",
  "Scooby-Doo found the missing context. Jinkies:",
  "Dunder Mifflin filed your session under 'important':",
  "That's what she resumed. Use:",
  "The One Where You Come Back With:",
  "How you doin'? Your session says:",
  "Suit up. Legendary context awaits at:",
  "Have you tried turning the session back on with:",
  "Bears. Beets. Battlestar resume command:",
  "The truth is out there, and so is your session:",
  "No soup for quitters. Resume with:",
  "Say my session ID. Then run:",
  "Yeah science! Your context survived:",
  "I'm the one who resumes. Use:",
  "Stranger things have happened than returning with:",
  "The Upside Down kept your context warm:",
  "Nobody puts this session in a corner. Resume with:",
  "Hasta la vista, briefly. Come back with:",
] as const;

function disabledByEnv(): boolean {
  const value = process.env[DISABLE_ENV]?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes" || value === "on";
}

function pickExitMessage(): string {
  return EXIT_MESSAGES[Math.floor(Math.random() * EXIT_MESSAGES.length)] ?? "Pi session saved.";
}

function buildHint(sessionId: string, exitMessage = pickExitMessage()): string {
  return `\n╭─ ${exitMessage}\n╰─ pi --session ${sessionId}\n\n`;
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

      const hint = buildHint(sessionId);
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

    process.stderr.write(buildHint(sessionId));
  });
}
