#!/bin/bash
# Rebuild the test site's SPA after a git pull.
#
# RESOLVED 2026-09-16: this path is the correct one. The live vhost on the box
# reads `root /srv/clients/mncardio/frontend/build;` and /var/www/mncardio does
# not exist at all - it was the nginx file in this repo that was wrong, and it
# has been corrected. Nothing to do here.
#
# nginx serves /srv/clients/mncardio/frontend/build, so the pull alone changes
# nothing a browser sees until this runs. Node 24 lives alongside the system
# Node 22 that other tenants depend on (see ecosystem.config.js), so the build
# is pinned to it explicitly rather than relying on the login PATH.
set -euo pipefail

export PATH=/opt/node-24/bin:$PATH
cd /srv/clients/mncardio/frontend

echo "node: $(node -v)"
# The version is baked into the bundle by vite.config.js at build time, so this
# line says what users are about to see - bump it BEFORE deploying, not after.
echo "version: $(node -p "require('./package.json').version")"
echo "before: $(stat -c '%y' build 2>/dev/null || echo 'no build dir')"

npm run build 2>&1 | tail -15

echo "after:  $(stat -c '%y' build)"
ls -la build/index.html
