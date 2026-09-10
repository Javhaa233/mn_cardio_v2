import 'package:flutter/material.dart';

/// Өнгөний тогтолцоо.
///
/// Гол өнгө нь тайван эмнэлгийн хөх-ногоон. **Улаан өнгийг зөвхөн эмнэлзүйн
/// анхааруулгад** үлдээсэн: бүх товч улаан байвал жинхэнэ анхааруулга нүдэнд
/// торохоо больдог. Зүрхний хэмнэл, даралтын хэвийн бус утга зэрэг л улаанаар
/// тэмдэглэгдэнэ.
class AppColors {
  AppColors._();

  // Брэнд
  static const Color primary = Color(0xFF0F6B7B);
  static const Color primaryDark = Color(0xFF0A4E5A);
  static const Color primaryLight = Color(0xFFE0F2F4);

  // Эмнэлзүйн төлөв
  static const Color danger = Color(0xFFD64550);
  static const Color dangerLight = Color(0xFFFDECEE);
  static const Color warning = Color(0xFFB8860B);
  static const Color warningLight = Color(0xFFFDF6E3);
  static const Color success = Color(0xFF2E7D5B);
  static const Color successLight = Color(0xFFE6F4EE);
  static const Color info = Color(0xFF2C5F9E);
  static const Color infoLight = Color(0xFFEAF1FA);

  // Гадаргуу — гэрэл
  static const Color background = Color(0xFFF6F7F9);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceAlt = Color(0xFFEFF2F5);
  static const Color border = Color(0xFFDCE1E7);

  // Гадаргуу — харанхуй
  static const Color backgroundDark = Color(0xFF10161A);
  static const Color surfaceDark = Color(0xFF19212A);
  static const Color surfaceAltDark = Color(0xFF222C36);
  static const Color borderDark = Color(0xFF33404C);

  // Текст — гэрэл
  static const Color textPrimary = Color(0xFF16202A);
  static const Color textSecondary = Color(0xFF5A6875);
  static const Color textMuted = Color(0xFF8A97A3);

  // Текст — харанхуй
  static const Color textPrimaryDark = Color(0xFFECF1F5);
  static const Color textSecondaryDark = Color(0xFFA9B6C2);
  static const Color textMutedDark = Color(0xFF7C8A97);

  /// Хэмжилтийн график дээрх шугамууд.
  static const Color chartSystolic = Color(0xFFD64550);
  static const Color chartDiastolic = Color(0xFF2C5F9E);
  static const Color chartPulse = Color(0xFF0F6B7B);
  static const Color chartWeight = Color(0xFF7A5AA8);
  static const Color chartSpo2 = Color(0xFF2E7D5B);
}
