#!/bin/bash
# Gets a Claude Code cloud session ready for design work on the shop: the
# Playwright CLI and the browser it drives, and the Impeccable engine.
# On anyone's own machine it does nothing.
#
# Nothing here may stop a session from starting. Each step reports what went
# wrong and carries on.
set -uo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "$0")/../.." && pwd)}"

# The playwright-cli skill drives the browser through this command. Installed
# globally so it lands in the cached container and later sessions skip this.
if ! command -v playwright-cli >/dev/null 2>&1; then
  npm install -g --no-audit --no-fund --silent @playwright/cli@0.1.21 >/dev/null 2>&1 \
    || echo "session-start: could not install @playwright/cli" >&2
fi

# Cloud sessions ship an older Chromium than this Playwright release looks for,
# and run as root, where Chromium cannot start its sandbox. Point the CLI at the
# browser that is here, with the sandbox off. Its own download host is blocked.
if [ -x /opt/pw-browsers/chromium ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  {
    echo 'export PLAYWRIGHT_MCP_EXECUTABLE_PATH=/opt/pw-browsers/chromium'
    echo 'export PLAYWRIGHT_MCP_SANDBOX=false'
  } >> "$CLAUDE_ENV_FILE"
fi

# Fetch and checksum the Impeccable engine now, so the first design check in
# the session does not wait for the download.
ENGINE="$ROOT/.claude/skills/impeccable/scripts/impeccable"
if [ -x "$ENGINE" ]; then
  "$ENGINE" engine-probe >/dev/null 2>&1 \
    || echo "session-start: could not fetch the Impeccable engine" >&2
fi

exit 0
