#!/bin/bash
# Bring the test box's node_modules in line with the lockfiles after a git pull.
#
# The deploy loop is a pull plus a rebuild, and a pull never installs anything:
# on 2026-09-17 the 2.1.0 security patches had been deployed for a day while the
# server still ran the unpatched tree. `npm ls` said nothing, because the old
# versions still satisfied package.json's ranges.
#
# `npm install`, not `npm ci`: ci deletes node_modules first, underneath the
# running API. npm 11 rewrites the lockfiles as it goes, so they are put back
# afterwards - otherwise the checkout looks dirty and "what is on test?" has no
# clean answer.
#
# The box's npm skips install scripts (puppeteer, sharp). Both survived the
# 2026-09-17 sync, but that is checked below rather than assumed: a missing
# Chrome breaks every server-side PDF.
set -euo pipefail

export PATH=/opt/node-24/bin:$PATH
ROOT=/srv/clients/mncardio

for d in backend frontend; do
  cd "$ROOT/$d"
  echo "== $d"
  npm install --no-audit --no-fund 2>&1 | grep -vE '^npm warn install-scripts' | tail -3
  printf 'invalid or missing: '
  npm ls --all 2>&1 | grep -cE 'invalid|missing' || true
done

git -C "$ROOT" checkout -- backend/package-lock.json frontend/package-lock.json

cd "$ROOT/backend"
node -e "const p=require('puppeteer');const e=p.executablePath();console.log('chrome', require('fs').existsSync(e) ? 'ok' : 'MISSING: ' + e)"
node -e "require('sharp');console.log('sharp ok')"
git -C "$ROOT" status --short
