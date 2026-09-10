# Client code

Two things here, for two different jobs.

| | |
|---|---|
| [`smoke.js`](smoke.js) | **Runnable today.** Proves your credentials and the network path work, before you install anything. |
| [`dart/`](dart/) | **Liftable.** Drop into `mobile/app/lib/core/` and start calling endpoints. |

---

## smoke.js

Ten calls against the test server: health, both logins, `/me` on each surface, a
journal read, the rehab catalogue, a token refresh, and a check that a doctor token is
correctly refused by the patient surface.

Node stdlib only — no `npm install`, and nothing is added to any repository's dependencies.

```powershell
$env:MNCARDIO_PATIENT_USER     = '...'
$env:MNCARDIO_PATIENT_PASSWORD = '...'
$env:MNCARDIO_DOCTOR_USER      = '...'
$env:MNCARDIO_DOCTOR_PASSWORD  = '...'
node mobile/client/smoke.js
```

```
MnCardio smoke test  ->  https://mncardio.itsystem.mn

  PASS  GET  /health  2026-09-10T05:52:13.430Z
  PASS  POST /api/PatientUser/Login  token eyJhbGciOiJI...
  PASS  GET  /api/patient/me  Тохиолдол Тохиолдол
  PASS  GET  /api/patient/journal?limit=5  5 row(s)
  PASS  GET  /api/patient/rehab/exercises  0 exercise(s)  (expected - catalogue not seeded yet)
  PASS  POST /api/User/Login  token eyJhbGciOiJI...
  PASS  GET  /api/doctor/me  Г.Нэргүй  RoleId="3"
  PASS  GET  /api/doctor/visits?limit=5  5 visit(s)
  PASS  POST /api/auth/refresh  expiresIn 36000s
  PASS  GET  /api/patient/me with a doctor token is refused  403 NOT_A_PATIENT

10 passed, 0 failed
```

**If the names print as `?????`, stop and fix your terminal before writing any code** — you
have an encoding problem that will follow you into the app. On PowerShell:
`[Console]::OutputEncoding = [Text.Encoding]::UTF8`. Do not use Git Bash for this project's
Cyrillic.

Exit code is 0 on success and 1 on any failure, so it works as a post-deploy smoke check too.
Point it elsewhere with `MNCARDIO_BASE`.

It prints live values to your terminal and deliberately writes nothing to disk — the test
database is a restore of production.

---

## dart/

Five files, no package of their own. Copy them into `mobile/app/lib/core/` and adjust the
imports.

| File | What it is |
|---|---|
| `api_client.dart` | The `dio` instance, the envelope interceptor, `ApiException`, and single-flight refresh-and-replay |
| `token_store.dart` | Both JWTs in the Keystore / Keychain |
| `auth_api.dart` | Login, session, logout, password reset |
| `patient_api.dart` | Modules 2.1–2.7 |
| `doctor_api.dart` | Rows 28–32 |

### pubspec.yaml

```yaml
dependencies:
  dio: ^5.7.0
  flutter_secure_storage: ^9.2.2
```

Pin exact versions and commit `pubspec.lock`. The rest of the package list — `local_auth`,
`socket_io_client`, `intl`, `file_picker` — is in [../FLUTTER.md](../FLUTTER.md).

### Wiring it up

```dart
final tokens = TokenStore();
final api = ApiClient(
  baseUrl: 'https://mncardio.itsystem.mn',
  tokens: tokens,
  onSessionExpired: () => navigator.go('/login'),
);

final auth    = AuthApi(api, tokens);
final patient = PatientApi(api);
final doctor  = DoctorApi(api);

// Login stores the access token AND bootstraps a refresh token in one step.
await auth.loginPatient(regNo, password);

final me   = await patient.me();
final rows = await patient.journal(limit: 20);
```

On launch, prefer `auth.session()` over calling a data endpoint to find out whether you are
still logged in — it answers the question directly instead of making you interpret an error.

### What it does for you, and why it matters

**Both response envelopes become one exception type.** The legacy layer answers **HTTP 200
for every failure**, including auth failures, so a client that checks `statusCode` treats
"your token is invalid" as success and renders an empty list forever. Every response passes
through one interceptor that reads the envelope rather than the status.

**Branch on `code`, never on `message`.** `ApiException.code` is stable
(`PATIENT_NOT_RESOLVED`, `DATE_REQUIRED`, `SEARCH_TOO_SHORT`). `message` is a Mongolian
display string, already safe to show the user, and will be reworded.

**Refresh is single-flight.** Ten parallel calls hitting an expired token trigger one
refresh, not ten, and the refresh call itself is never retried — that is how you get an
infinite loop. The failed request is replayed once the new token lands.

**`RoleId` is normalised.** It arrives as a number from `/api/auth/session` and a string
from `/api/doctor/me`. `ApiClient.roleIdOf()` exists so `== 3` versus `== '3'` never becomes
a bug you have to find.

### What it deliberately does not do

- **No models.** Methods return `Map<String, dynamic>`. The field dictionary is still moving
  and typed models would be churn; add them per screen once a shape settles.
- **No chat.** Chat is the legacy layer with its own three-call attachment sequence and a
  Socket.IO connection — it belongs in its own module. [../API.md](../API.md) §5 has the
  contract.
- **No file upload.** The multipart shape mirrors a browser file input and needs deliberate
  glue; [../FLUTTER.md](../FLUTTER.md) has the `FormData` snippet and [../API.md](../API.md)
  §7 the full contract. The rule that costs data if broken: every field needs its
  `<Field>Info` sidecar, because omitting one soft-deletes the file that was there.
- **No biometrics.** Device-local and nothing to do with the API — gate the stored token
  behind `local_auth`. Never send biometric material to the server.

---

## Before you build a screen, check it is not inert

Several surfaces answer 200 and still cannot carry a finished feature yet — the rehab
exercise catalogue is empty, `risk` returns inputs with no score, `evisits` has no booking or
video, and patients receive no notifications. [../READINESS.md](../READINESS.md) is the full
picture; [../QUICKSTART.md](../QUICKSTART.md) has the short version.
