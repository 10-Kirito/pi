#!/usr/bin/env bash
# Roll the globally-installed Pi back to the stable version.
#
# Usage: ./pi-rollback-stable.sh
#
# Restores from ~/.pi-backup-stable when present (offline, exact), otherwise
# reinstalls the published stable from npm.
set -euo pipefail

BACKUP_DIR="$HOME/.pi-backup-stable"
GLOBAL_PKG_DIR="$(npm root -g)/@earendil-works/pi-coding-agent"
STABLE_VERSION="${PI_STABLE_VERSION:-0.84.4}"

if [[ -d "$BACKUP_DIR" ]]; then
	echo "Restoring stable Pi from $BACKUP_DIR ..."
	rm -rf "$GLOBAL_PKG_DIR"
	mv "$BACKUP_DIR" "$GLOBAL_PKG_DIR"
else
	echo "No backup found; reinstalling ${STABLE_VERSION} from npm ..."
	npm install -g "@earendil-works/pi-coding-agent@${STABLE_VERSION}"
fi

echo
echo "Done. Current Pi:"
pi --version
