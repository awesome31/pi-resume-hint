# pi-resume-hint

A tiny [Pi](https://github.com/badlogic/pi-mono) extension that prints a Codex-style resume hint when Pi exits.

When you quit Pi, it prints the current session id and the command to resume it:

```text
╭─ Pi session saved
│ Resume this session with:
│   pi --session 123e4567-e89b-12d3-a456-426614174000
│
│ From any directory, use:
│   cd '/path/to/project' && pi --session 123e4567-e89b-12d3-a456-426614174000
│
│ Session file: /Users/me/.pi/agent/sessions/.../session.jsonl
╰────────────────────
```

## Install

From this local checkout:

```bash
pi install /Users/rohittyagi/Documents/learn/pi-resume-hint
```

Or test for one run without installing:

```bash
pi -e /Users/rohittyagi/Documents/learn/pi-resume-hint
```

After installing, restart Pi or run `/reload`.

## Usage

Quit Pi normally. The extension listens for Pi's `session_shutdown` event with reason `quit` and writes the hint to stderr.

You can also show the current hint at any time:

```text
/resume-hint
```

## Disable temporarily

Set this environment variable before starting Pi:

```bash
PI_RESUME_HINT_DISABLE=1 pi
```

Accepted truthy values are `1`, `true`, `yes`, and `on`.

## Package details

This is a Pi package. `package.json` declares:

```json
{
  "pi": {
    "extensions": ["./extensions"]
  }
}
```

Pi loads `extensions/index.ts` directly; no build step is required.

## License

MIT
