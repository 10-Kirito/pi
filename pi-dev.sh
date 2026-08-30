#!/usr/bin/env bash
# Run the dev (source) Pi in an isolated config/session dir, separate from the
# stable ~/.pi/agent installation. The isolated dir must already be seeded with
# auth.json + settings.json (see ~/.pi-dev/agent).
#
# Usage:
#   ./pi-dev.sh                      # interactive TUI
#   ./pi-dev.sh -p "prompt"          # one-shot prompt
#   ./pi-dev.sh --list-models        # list models
#   ./pi-dev.sh --no-env ...         # run with API keys unset
#
# Override the isolated dirs with PI_DEV_AGENT_DIR / PI_DEV_SESSION_DIR.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

export PI_CODING_AGENT_DIR="${PI_DEV_AGENT_DIR:-$HOME/.pi-dev/agent}"
export PI_CODING_AGENT_SESSION_DIR="${PI_DEV_SESSION_DIR:-$HOME/.pi-dev/sessions}"

mkdir -p "$PI_CODING_AGENT_DIR" "$PI_CODING_AGENT_SESSION_DIR"

exec "$SCRIPT_DIR/pi-test.sh" "$@"
