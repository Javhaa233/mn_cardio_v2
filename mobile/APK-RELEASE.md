# Building and publishing the Android APK

How the test build at <https://mncardio.itsystem.mn/apk> is produced and put there.

Everything below is the **test** distribution. Production (`smr.telemedicine.mn`) is not part of
this and never has been: the customer uploads production themselves.

---

## Where the app is

`C:\Ajil\mncardio-github\mobile\app` — and **only** there.

This is worth stating plainly because it contradicts how the rest of the repository works. The
working tree at `C:\Ajil\mn_cardio_v2` is the source of truth for the backend, the frontend and
these docs, and `mobile/tools/export-to-github.js` copies it into the GitHub clone. The Flutter
app is the exception: it exists in the clone and nowhere else. The export script only ever
copies and never deletes, so the app survives each export untouched.

Two consequences:

- Editing `mobile/app` from the working tree is impossible — the directory is not there.
- Running `flutter create` in the working tree would produce a **second, divergent** copy. Don't.

The app belongs to the mobile developer (Aagii0114). We build it; we do not change it. Anything
found while building goes back to them as a written list — see
[`MOBILE-APP-FINDINGS-2026-09-16.md`](MOBILE-APP-FINDINGS-2026-09-16.md) for the current one.

## What you need

Already installed on the build machine, at `C:\dev`:

| | Version |
|---|---|
| Flutter | 3.44.8 (stable) — `pubspec.yaml` requires ≥ 3.27 |
| JDK | 17 (Temurin) — `build.gradle.kts` sets source/target 17 |
| Android SDK | build-tools 35/36, platforms 34–36, NDK, licences accepted |

`ANDROID_HOME` and `ANDROID_SDK_ROOT` both point at `C:\dev\android-sdk`.

**Build on this machine, not on the server.** The test box is a shared VPS running six other
customers' sites on 7.4 GB of RAM, and `android/gradle.properties` alone asks Gradle for an 8 GB
heap. An Android toolchain there would cost roughly 10 GB of disk and fight the tenants for CPU
on every build.

## Build

```bash
cd C:/Ajil/mncardio-github/mobile/app
flutter pub get
flutter build apk --release --dart-define=MNCARDIO_API_BASE_URL=https://mncardio.itsystem.mn
```

The artifact lands in **`mobile/build/app/outputs/flutter-apk/app-release.apk`** — note
`mobile/build`, not `mobile/app/build`: `android/build.gradle.kts` relocates the build directory
up two levels.

`--dart-define` is belt-and-braces. `lib/core/config/app_config.dart:26` already defaults to the
same URL, but passing it explicitly means the artifact does not silently change target if that
default is ever edited.

### Expect the first build to fail on the network

Gradle pulls the Android Gradle Plugin from `dl.google.com`, and several Flutter plugins pin
their own older AGP versions (`flutter_timezone` wants 7.3.0, `open_filex` wants 8.1.0), so the
first build downloads a lot. On a slow link it times out:

```
Could not download gradle-7.3.0.jar (com.android.tools.build:gradle:7.3.0)
   > Read timed out
```

That is a network fault, not a code fault. Gradle keeps what it already fetched, so each retry
gets further. Raise the timeouts rather than just re-running:

```bash
export GRADLE_OPTS="-Dorg.gradle.internal.http.connectionTimeout=180000 \
  -Dorg.gradle.internal.http.socketTimeout=180000 \
  -Dorg.gradle.internal.repository.max.retries=10"
```

Budget 20–40 minutes for a cold first build. Later builds are minutes.

### And then Android SDK 37, which is three problems wearing one coat

`permission_handler_android` 14.1.0 sets `compileSdk = 37` and publishes AAR metadata requiring
everything that depends on it to do the same. Flutter 3.44 defaults to 36. Getting from there to
a build takes three separate fixes, and each one only reveals the next.

**1. The app must compile against 37.** Done, in `android/app/build.gradle.kts`:

```kotlin
compileSdk = 37      // was flutter.compileSdkVersion
```

Without it: `Execution failed for task ':app:checkReleaseAarMetadata'` — "`:app` is currently
compiled against android-36". This is safe. `compileSdk` decides only which APIs the code may
*reference*; `minSdk` (which devices can install) and `targetSdk` (which runtime behaviour the
app opts into) are untouched and still come from Flutter. AGP 9.0.1 calls 36 its highest
*recommended* compileSdk, so a warning here is expected rather than a fault.

**2. The platform package Flutter installs is malformed.** Flutter notices 37 is needed and
downloads it for you — as `platforms/android-37.0/`, note the `.0`, carrying

```
AndroidVersion.ApiLevel=37.0     # source.properties
<api-level>37.0</api-level>      # package.xml
path="platforms;android-37.0"    # package.xml
```

AGP parses `api-level` as an integer and resolves targets by directory name, so the hash string
`android-37` matches nothing and you get:

```
Failed to find target with hash string 'android-37' in: C:\dev\android-sdk
```

This is Android's new *minor SDK version* scheme: upstream publishes `android-37.0`, `37.1`,
`37.2` and no plain `android-37` at all — check with `sdkmanager --list`. Give AGP the name it
wants, in the SDK rather than in the project:

```bash
cd $ANDROID_HOME/platforms
cp android-37.0/source.properties android-37.0/source.properties.orig
cp android-37.0/package.xml       android-37.0/package.xml.orig
mv android-37.0 android-37
sed -i 's/^AndroidVersion\.ApiLevel=37\.0$/AndroidVersion.ApiLevel=37/' android-37/source.properties
sed -i 's|<api-level>37\.0</api-level>|<api-level>37</api-level>|; \
        s|path="platforms;android-37\.0"|path="platforms;android-37"|' android-37/package.xml
```

Both must be patched — fixing only `source.properties` still fails. Afterwards
`sdkmanager --list_installed` reports `platforms;android-37`, which is how you know it took. The
SDK manager will re-download `android-37.0` alongside it on the next build; harmless, leave it.

`Platform.Version=17` in that file is **correct** and must be left alone — Android 17 is API 37,
exactly as Android 16 is API 36.

**3. Kill the Gradle daemons afterwards.** The daemon caches the SDK package list from when it
started, so a daemon that saw the broken metadata keeps reporting `Failed to find target` however
many times you fix the files and rerun:

```bash
# Windows
powershell -Command "Get-Process java | Stop-Process -Force"
```

This one cost two full rebuilds. If the error message has not changed after a fix that should
have worked, suspect the daemon before suspecting the fix.

### Signing — read this before the second release

The release build is signed with the **debug keystore**
(`android/app/build.gradle.kts:33`, still carrying the stock Flutter `TODO`). That is deliberate
for a test build, and it has one consequence that bites later:

> The debug keystore is generated per machine at `~/.android/debug.keystore`. Every rebuild from
> **this** machine carries the same signature and installs cleanly over the previous one. A
> rebuild from any other machine has a different signature, and every tester must uninstall
> before they can update.

So: **back up `~/.android/debug.keystore`** alongside `ssh.env`, and build releases from one
machine until the real key exists.

The real key is the customer's. `mobile/app/SETUP.md` §8 is explicit that it must be owned by
ЗСҮТ — if we generate and hold it, the app cannot be updated after handover. It is tracked as a
blocker together with the Play Store account (`BLOCKERS.md` §2).

## Publish

```powershell
# 1. upload — chunked, because --put pushes the whole base64 payload in one exec
uv run --with paramiko python rsh.py --host test --put-chunked `
    C:\Ajil\mncardio-github\mobile\build\app\outputs\flutter-apk\app-release.apk `
    /srv/clients/mncardio-apk/apk/mncardio-<version>.apk

# 2. build the download page (Node stdlib only, no dependencies)
node deploy/scripts/make-apk-page.js <apk> <version> <out-dir>
uv run --with paramiko python rsh.py --host test --put <out-dir>\index.html `
    /srv/clients/mncardio-apk/apk/index.html

# 3. republish the symlink and fix permissions
uv run --with paramiko python rsh.py --host test --script deploy/scripts/20-publish-apk.sh
```

Use `--put-chunked`, not `--put`. `--put` builds the entire base64 payload in memory and pushes
it through a single exec channel — fine for a config file, a poor bet for ~66 MB. The chunked
form sends 2 MB at a time and compares sha256 on both ends, removing the remote file if they
differ. A half-uploaded APK that nginx will happily serve is the failure worth spending code to
prevent. Expect roughly two minutes up and 40 seconds back down.

Getting that to work over this link took three fixes, all of which surface as the *same*
misleading error — `EOFError`, or "An existing connection was forcibly closed by the remote
host (10054)", which reads like a server-side refusal and is not one:

- **Don't hand paramiko a multi-megabyte `sendall`.** It outruns the channel's flow-control
  window and the transport dies partway through. Writes are sliced to 32 KiB.
- **Hash the file *before* connecting.** This is the one that cost an afternoon. The first read
  of a large unseen `.apk` on Windows blocks while Defender scans it. Do that after connecting
  and the SSH session sits idle long enough to be dropped — so the upload failed on chunk 1 at
  **0 bytes**, identically every time, which looked exactly like the server rejecting large
  transfers. A 3 MB test file uploaded fine throughout, because it scans instantly. That false
  contrast is what made it hard to see.
- **Keepalive and resume.** `connect()` sets a 20-second keepalive, and a dropped chunk
  reconnects and retries from the last verified byte rather than restarting. The successful
  66 MB upload still dropped twice mid-transfer and recovered both times, so this is not
  belt-and-braces — the link genuinely needs it.

One PowerShell trap while you are at it: piping this command into `Select-Object -First N` kills
the upload as soon as N lines have been printed. Use `-Last N`, or don't pipe.

### Before committing: clear the iOS ephemeral directory

`flutter pub get` writes `mobile/app/ios/Flutter/ephemeral/flutter_native_integration.env`, and
`verify-no-secrets.js` **fails on it** — it matches files by name (`*.env`) rather than by
content, and it scans the filesystem rather than the git index. That strictness is deliberate
and worth keeping: it exists because real credentials once reached a repo shared with an outside
developer.

The file holds nothing secret (Flutter root, build name and number, target paths), and
`ios/.gitignore` already excludes `Flutter/ephemeral/`, so it cannot be pushed. But the verifier
must print PASS before a commit, so delete it — Flutter regenerates it on demand:

```bash
rm -rf mobile/app/ios/Flutter/ephemeral
```

### Where it lives, and why it is not where you'd expect

```
/srv/clients/mncardio-apk/apk/
  mncardio-<version>.apk     the artifact
  mncardio-latest.apk        symlink, what the page links to
  index.html                 the download page
```

`/srv/clients/mncardio-apk` is a **sibling** of the git checkout at `/srv/clients/mncardio`, not
a directory inside it. Every deploy runs `git reset --hard origin/main` over that tree and
rebuilds the frontend into it. An APK stored there would be one `git clean -fd` from gone.

### nginx

Two blocks in `deploy/nginx/mncardio.itsystem.mn.conf`, installed on the live vhost on
2026-09-16. This is a **one-time** change — publishing a new APK afterwards needs no nginx work.

The regex block exists because nginx's `mime.types` has **no `.apk` entry**, so `default_type`
has to be set for that path. It is set inside the regex location and only there: a server-level
`types` block would replace the whole inherited map and break every other content type on the
site. The `monhorus-apk` site already on this box does the same thing for the same reason, and
its config says so — worth reading if this ever needs changing.

Without a `location /apk`, the SPA fallback (`try_files $uri $uri/ /index.html`) answers `/apk`
with the React app and HTTP 200, which reads exactly like the upload having silently failed.
`/health` is the existing precedent for a path that needs its own block.

Remember that certbot rewrote the live vhost in place to add the `:443` block, so the file on
the server is not the repo copy. Edit the live file, `cp -a` it first, `nginx -t` before any
reload, and back-port the change into the repo copy so the two do not drift.

### The in-app update check

`backend/scripts/set_mobile_apk_download_url.sql` sets `storeUrlAndroid` in the `MobileSetting`
table to the `/apk` URL. `lib/core/update/update_controller.dart` reads it from
`GET /api/mobile/version` on launch and prefers it over `storeUrl`, so the app points users at
this page with **no client change at all**.

It is data, not DDL, and the table is registered in `ModelConfigs/MobileSettingConfig.js` — so it
can also be edited from the admin web UI through `/api/BaseObject`, with no script and no deploy.

`minSupportedBuild` and `forceUpdate` are left alone on purpose. They are the lockout switch, and
nobody should be locked out of a first test build.

## Versioning

The APK version comes from `mobile/app/pubspec.yaml` (`version: 0.1.0+1`).

`mobile/tools/bump-version.js` does **not** touch it — that script raises the backend and frontend
versions together for a web deploy, and the app's number is managed separately. So a new APK
needs the mobile developer to raise `pubspec.yaml` first. If they don't, two different builds
ship as the same version and the update check cannot tell them apart.

After each release, update `latestVersion` and `latestBuild` in `MobileSetting` to match.

## iOS

Not built, and not buildable here. It needs macOS and Xcode, and there is no Apple Developer
account — `BLOCKERS.md` §2, which also notes that an Apple organisation enrolment needs a D-U-N-S
number and takes weeks. The `ios/` directory is present and configured
(`DEVELOPMENT_TEAM` set, deployment target 13.0, Mongolian `Info.plist` usage strings), so it is
waiting on the account rather than on code.
