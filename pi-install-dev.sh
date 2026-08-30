#!/usr/bin/env bash
# Replace the globally-installed Pi with the local dev build.
#
# Usage: ./pi-install-dev.sh
#
# 1. Backs up the current (stable) install to ~/.pi-backup-stable (first run only).
# 2. Builds the workspace.
# 3. Installs packages/coding-agent globally.
#
# Roll back later with: ./pi-rollback-stable.sh
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BACKUP_DIR="$HOME/.pi-backup-stable"
GLOBAL_PKG_DIR="$(npm root -g)/@earendil-works/pi-coding-agent"
# Default to the offline build (model data already hydrated). Override with
# PI_BUILD_SCRIPT=build to re-fetch the model catalog from the network.
BUILD_SCRIPT="${PI_BUILD_SCRIPT:-build:offline}"

# Preserve the original stable install once, so rollback can restore it offline.
if [[ -d "$GLOBAL_PKG_DIR" && ! -d "$BACKUP_DIR" ]]; then
	cp -R "$GLOBAL_PKG_DIR" "$BACKUP_DIR"
	echo "Backed up current Pi to $BACKUP_DIR"
fi

echo "Building workspace (npm run $BUILD_SCRIPT) ..."
npm run "$BUILD_SCRIPT"

echo "Installing dev Pi globally ..."
npm install -g ./packages/coding-agent

echo
echo "Done. Current Pi:"
pi --version
echo "Run ./pi-rollback-stable.sh to restore the stable version."
