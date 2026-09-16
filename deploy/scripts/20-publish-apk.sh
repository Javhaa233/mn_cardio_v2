#!/usr/bin/env bash
#
# Put the uploaded Android APK live.
#
#   uv run --with paramiko python rsh.py --script deploy/scripts/20-publish-apk.sh
#
# Runs as `its`. Needs no sudo: /srv/clients/mncardio is owned by that user, and
# the nginx side of this is a one-time change already made (see
# deploy/nginx/mncardio.itsystem.mn.conf, `location /apk`).
#
# Takes no arguments — rsh.py --script cannot pass any. It finds the newest .apk
# in the directory and republishes the symlink, so the upload step decides which
# build goes live and this step is always the same.
#
# The APK lives OUTSIDE the git checkout on purpose. A deploy runs
# `git reset --hard origin/main` over /srv/clients/mncardio and rebuilds the
# frontend into it, so /srv/clients/mncardio-apk sits alongside it instead.

set -euo pipefail

APKROOT=/srv/clients/mncardio-apk/apk
LATEST=mncardio-latest.apk

if [ ! -d "$APKROOT" ]; then
    echo "no such directory: $APKROOT — upload the APK first" >&2
    exit 1
fi

cd "$APKROOT"

# -maxdepth 1 so the symlink we are about to write cannot be picked as its own
# target on a later run.
newest=$(find . -maxdepth 1 -type f -name '*.apk' -printf '%T@ %f\n' \
    | sort -rn | head -1 | cut -d' ' -f2-)

if [ -z "$newest" ]; then
    echo "no .apk file found in $APKROOT" >&2
    exit 1
fi

ln -sfn "$newest" "$LATEST"

# nginx runs as www-data and must be able to read these; the directory needs +x
# to be traversable at all.
chmod 644 ./*.apk
[ -f index.html ] && chmod 644 index.html
chmod 755 "$APKROOT"

echo "published: $newest"
echo
ls -la
echo
echo "sha256:"
sha256sum "$newest"
