import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Where the JWTs live.
///
/// `flutter_secure_storage` puts them in the Keystore / Keychain. **Not**
/// `shared_preferences`, which is plain text on a rooted device and would leave
/// a 10-hour token to a national EMR in the clear.
///
/// Two tokens, two lifetimes:
///  * access token  — 10 hours, sent as `Authorization: Bearer <token>`
///  * refresh token — 30 days, exchanged at `POST /api/auth/refresh`
///
/// Neither login endpoint returns a refresh token. You log in, then call
/// `/api/auth/refresh` once with the access token as Bearer to obtain the first
/// one. [AuthApi.bootstrapRefreshToken] does exactly that.
class TokenStore {
  TokenStore({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
              iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
            );

  static const _kAccess = 'mncardio.accessToken';
  static const _kRefresh = 'mncardio.refreshToken';

  final FlutterSecureStorage _storage;

  // Read-through cache: the interceptor asks for the access token on every
  // request, and a Keychain round trip per call is measurable.
  String? _access;
  String? _refresh;
  bool _loaded = false;

  Future<void> _ensureLoaded() async {
    if (_loaded) return;
    _access = await _storage.read(key: _kAccess);
    _refresh = await _storage.read(key: _kRefresh);
    _loaded = true;
  }

  Future<String?> get accessToken async {
    await _ensureLoaded();
    return _access;
  }

  Future<String?> get refreshToken async {
    await _ensureLoaded();
    return _refresh;
  }

  Future<bool> get hasSession async => (await refreshToken)?.isNotEmpty ?? false;

  /// Writes whichever tokens are supplied; a null argument leaves that one
  /// untouched, so a refresh response that omits one does not wipe it.
  Future<void> save({String? accessToken, String? refreshToken}) async {
    await _ensureLoaded();
    if (accessToken != null) {
      _access = accessToken;
      await _storage.write(key: _kAccess, value: accessToken);
    }
    if (refreshToken != null) {
      _refresh = refreshToken;
      await _storage.write(key: _kRefresh, value: refreshToken);
    }
  }

  /// Logging out is entirely a client-side act.
  ///
  /// `LogOut` on both login controllers is a stub — it returns success without
  /// invalidating anything server-side, so a token stays valid until it
  /// expires. Deleting it here is the whole of logout.
  Future<void> clear() async {
    _access = null;
    _refresh = null;
    _loaded = true;
    await _storage.delete(key: _kAccess);
    await _storage.delete(key: _kRefresh);
  }
}
