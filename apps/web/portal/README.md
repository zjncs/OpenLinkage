Doctor Web - Consolidated Web Project
=====================================

This folder contains ALL code used by the deployed doctor web project, including:

- Site (static assets)
  - index.html
  - css/style.css
  - js/main.js
  - images/* (avatars and sample pictures)
- Minimal JSON API (Node.js)
  - server.js (serves /api/* and static files)
  - package.json (scripts: start)
- Deployment templates (infra-as-files)
  - deploy/Caddyfile (Caddy v2 site config with API reverse proxy)
  - deploy/doctor-web-api.service (systemd unit)
  - deploy/deploy.sh (reference deploy script to /opt/web)

Local Development
-----------------
- Static preview: open index.html in a browser.
- With API: `node server.js` then open http://localhost:5173

Deployment (reference)
----------------------
The site is served by Caddy on `www.tjucomments.xyz` with /api proxied to a local Node process.
Use `deploy/deploy.sh` as a reference to publish to `/opt/web`, install the systemd service, and reload Caddy.

