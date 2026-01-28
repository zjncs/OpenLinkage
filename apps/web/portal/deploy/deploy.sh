#!/usr/bin/env bash
set -euo pipefail

SRC_DIR=$(cd "$(dirname "$0")/.." && pwd)
DEST=/opt/web

echo "Deploying web to $DEST"
sudo mkdir -p "$DEST"
sudo cp -a "$SRC_DIR/." "$DEST/"
sudo chown -R caddy:caddy "$DEST" || true
sudo chmod -R o+rX "$DEST"

echo "Installing systemd unit"
sudo install -D -m 0644 "$SRC_DIR/deploy/doctor-web-api.service" /etc/systemd/system/doctor-web-api.service
sudo systemctl daemon-reload
sudo systemctl enable --now doctor-web-api.service

echo "Updating Caddyfile"
sudo install -D -m 0644 "$SRC_DIR/deploy/Caddyfile" /etc/caddy/Caddyfile
sudo systemctl reload caddy || sudo systemctl restart caddy

echo "Done. Verify:"
echo "  curl -fsSL http://127.0.0.1:5173/api/health"
echo "  curl -fsSL https://www.tjucomments.xyz/api/health"

