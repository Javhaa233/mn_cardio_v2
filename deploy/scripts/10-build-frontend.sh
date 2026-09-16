#!/bin/bash
# Rebuild the test site's SPA after a git pull.
#
# nginx serves /srv/clients/mncardio/frontend/build, so the pull alone changes
# nothing a browser sees until this runs. Node 24 lives alongside the system
# Node 22 that other tenants depend on (see ecosystem.config.js), so the build
# is pinned to it explicitly rather than relying on the login PATH.
set -euo pipefail

export PATH=/opt/node-24/bin:$PATH
cd /srv/clients/mncardio/frontend

echo "node: $(node -v)"
echo "before: $(stat -c '%y' build 2>/dev/null || echo 'no build dir')"

npm run build 2>&1 | tail -15

echo "after:  $(stat -c '%y' build)"
ls -la build/index.html
