import 'package:flutter/services.dart';
import 'package:local_auth/local_auth.dart';
import 'package:local_auth_android/local_auth_android.dart';
import 'package:local_auth_darwin/local_auth_darwin.dart';

/// Хурууны хээ / царайгаар нэвтрэх (Техникийн шаардлага §35).
///
/// Энэ нь **зөвхөн төхөөрөмж дээрх** шалгалт. Backend талд биометрийн
/// endpoint байхгүй бөгөөд байх ч шаардлагагүй: хурууны хээ төхөөрөмжөөс
/// хэзээ ч гарахгүй, зөвхөн Keystore/Keychain дотор хадгалсан токеныг
/// онгойлгох түлхүүр болж ажиллана (FLUTTER.md § "Biometric login").
class BiometricService {
  BiometricService({LocalAuthentication? auth})
      : _auth = auth ?? LocalAuthentication();

  final LocalAuthentication _auth;

  /// Төхөөрөмж биометр дэмждэг ба хэрэглэгч бүртгүүлсэн эсэх.
  Future<bool> isAvailable() async {
    try {
      final supported = await _auth.isDeviceSupported();
      if (!supported) return false;
      final canCheck = await _auth.canCheckBiometrics;
      if (!canCheck) return false;
      final enrolled = await _auth.getAvailableBiometrics();
      return enrolled.isNotEmpty;
    } on PlatformException {
      return false;
    }
  }

  /// Бүртгэгдсэн биометрийн төрлүүд — тохиргооны дэлгэц дээр нэрлэхэд.
  Future<List<BiometricType>> enrolledTypes() async {
    try {
      return await _auth.getAvailableBiometrics();
    } on PlatformException {
      return const <BiometricType>[];
    }
  }

  /// Бүртгэгдсэн төрлийн монгол нэр.
  static String describe(List<BiometricType> types) {
    if (types.contains(BiometricType.face)) return 'Царайгаар нэвтрэх';
    if (types.contains(BiometricType.fingerprint)) {
      return 'Хурууны хээгээр нэвтрэх';
    }
    if (types.contains(BiometricType.iris)) return 'Нүдний солонгоор нэвтрэх';
    return 'Биометрээр нэвтрэх';
  }

  /// Биометрийн шалгалт. Амжилттай бол `true`.
  ///
  /// Хэрэглэгч цуцалсан, төхөөрөмж дэмжихгүй зэрэг тохиолдолд алдаа шидэлгүй
  /// `false` буцаана — дуудагч тал нууц үгийн урсгал руу шилжинэ.
  Future<bool> authenticate({
    String reason = 'МнКардио аппад нэвтрэхийн тулд таниулна уу',
  }) async {
    try {
      return await _auth.authenticate(
        localizedReason: reason,
        options: const AuthenticationOptions(
          biometricOnly: false, // PIN/хээ ч мөн зөвшөөрнө — хүртээмжийн үүднээс
          stickyAuth: true,
          useErrorDialogs: true,
        ),
        authMessages: const <AuthMessages>[
          AndroidAuthMessages(
            signInTitle: 'МнКардио',
            biometricHint: 'Таниулах',
            biometricNotRecognized: 'Таних боломжгүй байна. Дахин оролдоно уу.',
            biometricRequiredTitle: 'Биометр тохируулаагүй байна',
            biometricSuccess: 'Амжилттай',
            cancelButton: 'Болих',
            deviceCredentialsRequiredTitle: 'Түгжээ тохируулаагүй байна',
            deviceCredentialsSetupDescription:
                'Төхөөрөмжийнхөө түгжээг тохируулна уу.',
            goToSettingsButton: 'Тохиргоо руу очих',
            goToSettingsDescription:
                'Хурууны хээ эсвэл түгжээ тохируулаагүй байна. Тохиргоо руу орж тохируулна уу.',
          ),
          IOSAuthMessages(
            cancelButton: 'Болих',
            goToSettingsButton: 'Тохиргоо',
            goToSettingsDescription:
                'Face ID / Touch ID тохируулаагүй байна. Тохиргоо руу орж тохируулна уу.',
            lockOut: 'Түр хаагдлаа. Төхөөрөмжийн нууц кодоор нээнэ үү.',
          ),
        ],
      );
    } on PlatformException {
      return false;
    }
  }
}
