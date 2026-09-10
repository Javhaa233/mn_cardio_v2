# Flutter notes

Stack-specific guidance for building against this backend. Read [API.md](API.md) first —
this file assumes you know about the two envelopes.

The app lives in `mobile/app/`. Create it there:

```
cd mobile
flutter create --org mn.telemedicine --project-name mncardio app
```

---

## Packages

| Package | Why this one |
|---|---|
| `dio` | Interceptors are mandatory here, not optional — see the envelope problem below. `http` has no equivalent hook. |
| `flutter_secure_storage` | The JWT goes in the Keystore / Keychain. **Not** `shared_preferences`, which is plain text on a rooted device and would put a 10-hour token to a national EMR in the clear. |
| `local_auth` | `BiometricPrompt` / `LocalAuthentication` behind one API. Tender §2, tracker row 18. |
| `socket_io_client` | The backend runs Socket.IO, not raw WebSocket. A `WebSocket` client will not speak its protocol. |
| `intl` + `flutter_localizations` | Mongolian UI. |
| `file_picker`, `image_picker`, `record` | Chat attachments — documents, images, audio. |

Pin exact versions and commit `pubspec.lock`.

---

## The envelope interceptor — write this before your second screen

The legacy layer returns **HTTP 200 for every failure**, including auth failures. Without
this, `dio` reports success and your UI silently renders empty lists forever.

```dart
class ApiException implements Exception {
  final String message;   // already Mongolian, safe to show
  final String? code;     // stable, branch on this — never on the message
  final bool isAuthError;
  ApiException(this.message, {this.code, this.isAuthError = false});
}

// Both layers, normalised into one exception type.
dio.interceptors.add(InterceptorsWrapper(
  onResponse: (response, handler) {
    final body = response.data;
    if (body is Map) {
      // Legacy PascalCase: {Success, Message, Data, Option} — HTTP is always 200.
      if (body.containsKey('Success')) {
        if (body['Success'] != true) {
          return handler.reject(DioException(
            requestOptions: response.requestOptions,
            error: ApiException(
              body['Message'] ?? 'Алдаа гарлаа',
              isAuthError: body['AuthError'] == true,
            ),
          ));
        }
      }
      // New lowercase: {success, message, data, code} — real status codes,
      // so a failure normally arrives as onError. This catches the rest.
      else if (body.containsKey('success') && body['success'] != true) {
        return handler.reject(DioException(
          requestOptions: response.requestOptions,
          error: ApiException(body['message'] ?? 'Алдаа гарлаа', code: body['code']),
        ));
      }
    }
    handler.next(response);
  },
));
```

Branch on `code`, never on `message`. The messages are Mongolian display strings and will be
reworded; `PATIENT_NOT_RESOLVED` will not.

### Unwrapping

`/api/patient/*` puts the payload in `data`; the legacy layer puts it in `Data` with paging
in `Option`. Two small helpers beat remembering which is which at every call site.

---

## Auth and session

Store both tokens in `flutter_secure_storage`. The access token lasts 10 hours; the refresh
token lasts 30 days (`/api/auth/refresh`, [API.md](API.md) §2).

Bootstrap once after login — call `POST /api/auth/refresh` with the access token as Bearer to
obtain your first refresh token — then refresh with `{refreshToken}` from then on.

Refresh ahead of expiry rather than reacting to a 401, and add a `dio` `onError` interceptor
that, on `TOKEN_INVALID`, refreshes once and replays the request. Guard it with a single
in-flight future so ten parallel calls trigger one refresh, not ten, and never retry the
refresh call itself — that is how you get an infinite loop.

If the refresh fails, clear storage and route to login. `LogOut` invalidates nothing
server-side, so logging out is your job: delete both tokens.

### Biometric login is device-local

There is no biometric endpoint on the backend and none is needed. The pattern:

1. User logs in with username and password once. Store the token in secure storage, gated by
   `local_auth`.
2. On next launch, `authenticate()` unlocks the stored token.
3. When the access token expires, refresh with the stored refresh token — no password needed.
   Only when the 30-day refresh token expires does the user type a password again.

Never send a fingerprint or any biometric material to the server. It never leaves the device.

---

## Uploads

`/api/BaseObject/uploadFile` is shaped like a browser file input, so it needs deliberate
construction (full contract in [API.md](API.md) §7):

```dart
final form = FormData.fromMap({
  'LinkedObjectInfo': jsonEncode({
    'LinkedObjectId': messageId,
    'LinkedObjectName': 'ChatMessages',
    'FieldName': 'Attachment',
  }),
  'AttachmentInfo': jsonEncode({}),                 // sidecar: {} = new file
  'Attachment': await MultipartFile.fromFile(path), // part name matches the sidecar
});
```

Two rules that cost data if broken:

- **Every field needs its `<Field>Info` sidecar.** Omitting one soft-deletes the file that
  was there — that is how the web form signals removal.
- Chat attachments are a **three-step** sequence: `SendMessage(HasAttachment:true)` →
  `uploadFile` → `CommitMessage`. Skip the third and the message never reaches anyone.

Check the extension against the allowlist client-side before uploading; the server rejects
anything else outright and the failure arrives as a 200.

---

## Sockets

```dart
final socket = io.io('http://host:5001',
  io.OptionBuilder()
    .setPath('/chatmessage')                        // '/notification' for the other one
    .setTransports(['websocket'])
    .setAuth({'token': jwt})
    .build());
```

Two separate mount paths — `/chatmessage` and `/notification` — so two connections.

**Writes go over HTTP; the socket only fans out.** Never send a message over the socket. On
reconnect, re-fetch with `GetMessages` using `BeforeId` keyset paging rather than trusting
that you missed nothing.

**A backgrounded app receives nothing.** No FCM or APNs exists in the backend yet, so the OS
will kill the socket and the user will miss messages. Poll on resume, and treat realtime as a
foreground enhancement until push is built.

---

## Mongolian UI

Every user-visible string is Mongolian — labels, buttons, errors, empty states, loading
states, validation messages. This is tender §1, and English strings are a UAT failure, not a
polish item.

Server messages in both envelopes already come back Mongolian and are safe to display. Do not
translate them client-side, and do not build an English locale "for development" — it will
leak.

Dates and numbers go through `intl` with the `mn` locale. Watch text expansion in layouts:
Mongolian labels run noticeably longer than English ones and will overflow a row designed
against placeholder text.

---

## Project layout

Mirror the tender's module split, so a tracker row maps to a directory:

```
lib/
  core/         dio client, interceptors, secure storage, socket clients
  auth/         login, biometrics, password reset
  doctor/       Миний үзлэгүүд · хяналт · зөвлөгөө · тайлан
  patient/      2.1 бүртгэл · 2.2 тэмдэглэл · 2.3 асуулт · 2.4 зөвлөгөө
                2.5 эрсдэл · 2.6 цахим үзлэг · 2.7 сэргээн засах
  chat/
  shared/       widgets, theme, Mongolian formatting
```

**`patient/` and `doctor/` are both served by the backend today** — modules 2.1–2.4 and 2.6,
the full doctor module (`/api/doctor/*`, added 2026-09-10), chat, and session refresh. Start
wherever you like; none of it is blocked. See [READINESS.md](READINESS.md) for the four things
that still are.

---

## Before you build a screen, check it is not inert

Four patient-facing surfaces look available and are not: `rehab/*` returns 500 until one SQL
script runs, `risk` returns inputs with no score, `evisits` has no booking or video, and
patients are denied every notification row. The full list is [API.md](API.md) §7. Reading it
first is worth the ten minutes.
