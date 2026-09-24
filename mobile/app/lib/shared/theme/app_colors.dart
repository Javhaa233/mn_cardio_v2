import 'package:flutter/material.dart';

/// Өнгөний тогтолцоо — HeartFit маягийн ягаан-шүрэн хэв маяг (2026-09-22).
///
/// Үндсэн өнгө нь **логоны ягаан тал** (`assets/logo.png`, #EE147D) —
/// App Store дээрх HeartFit-ийн дулаан улаан хэв маягийг брэндээсээ
/// гаргалгүйгээр авахын тулд. Вебийн цэнхэр брэнд (`frontend/src/theme/
/// colors.js`) өөрчлөгдөөгүй; мобайл одоо түүнээс ялгаатай харагдана.
///
/// Хуучин нэрс (`cyan`, `cyanInk`, `brandGradient` …) 150 гаруй газар
/// хэрэглэгддэг тул нэрийг нь хэвээр үлдээж, утгыг нь ягаан гэр бүл рүү
/// шилжүүлэв. Нэр нь одоо өнгөө биш **үүргээ** илэрхийлнэ.
///
/// **КОНТРАСТЫН ДҮРЭМ — хэвээр.**
///   * [cyan] / [cyanDeep] — **зөвхөн текст бус**: заагч, хүрээ, график,
///     24px-ээс том дүрс.
///   * [cyanInk] (#C2185B) — **үг болох бүх зүйл**. Цагаан дээр 5.9:1, дээр
///     нь цагаан текст мөн 5.9:1.
///
/// Эмнэлзүйн анхааруулга ([danger]) нь улбар шар руу хазайсан улаан — ягаан
/// үндсэн өнгөнөөс нүдэнд ялгарахаар сонгосон. Хоёрыг ойртуулж болохгүй:
/// бүх товч "аюул" мэт харагдвал жинхэнэ анхааруулга торохоо больдог.
class AppColors {
  AppColors._();

  // ---------------------------------------------------------------- брэнд
  /// Үндсэн бичвэр — дулаан бараан, цэвэр хар биш.
  static const Color ink = Color(0xFF1E1A1F);

  /// Хоёрдогч бичвэр. Цагаан дээр 5.9:1.
  static const Color inkDim = Color(0xFF6B6168);

  /// Өнгөт (цагаан бус) гадаргуу дээрх хоёрдогч текст.
  static const Color inkMuted = Color(0xFF54474F);

  /// Ягаан — ЗӨВХӨН ТЕКСТ БУС.
  static const Color cyan = Color(0xFFF2547D);

  /// Гүн ягаан — ЗӨВХӨН ТЕКСТ БУС.
  static const Color cyanDeep = Color(0xFFE0306A);

  /// Текст ба дүүргэсэн товчны AA-тэнцэх шат.
  static const Color cyanInk = Color(0xFFC2185B);
  static const Color cyanInkHover = Color(0xFFAD1457);

  /// Градиентын эхлэл.
  static const Color indigo = Color(0xFFFF6B8B);

  /// Хавтан, товчны градиент — HeartFit-ийн "View Details" товч, нүүрний
  /// том карт.
  static const LinearGradient brandGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: <Color>[Color(0xFFEC3F6B), Color(0xFFC8126A)],
  );

  /// Товгор төв товч, жижиг градиент гадаргуу.
  static const LinearGradient navGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: <Color>[Color(0xFFFF5E83), Color(0xFFE0306A)],
  );

  /// Хуудасны дээд хэсгийн зөөлөн ягаан туяа — HeartFit-ийн дэвсгэр.
  static const LinearGradient canvasGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: <Color>[Color(0xFFFFE4EA), Color(0x00FFF6F8)],
  );

  /// Сонгогдсон цэсний товгор.
  static const Color navSelected = Color(0xFFFDE7EF);

  /// Чат, аватарын аялгуу. ЗӨВХӨН ТЕКСТ БУС.
  static const Color accent = Color(0xFFF2547D);

  // ------------------------------------------------------------ гадаргуу
  /// Хуудасны дэвсгэр — маш цайвар ягаан.
  static const Color canvas = Color(0xFFFFF6F8);

  /// Hover угаалга, чип.
  static const Color tint = Color(0x14EE147D);

  /// Үсэн хүрээ.
  static const Color hairline = Color(0x1A5C1030);
  static const Color hairlineStrong = Color(0x335C1030);

  static const Color focus = Color(0x8CF2547D);

  /// Дэлгэц бүрт нэг л удаа, хамгийн яаралтай зүйлд. Ягаан үндсэн өнгөнөөс
  /// ялгарахаар улбар шар-улаан.
  static const Color urgent = Color(0xFFE4572E);

  // ------------------------------------------- нэрийн тохирол (хуучин API)
  /// Үндсэн үйлдлийн өнгө. Цагаан дээр 5.9:1, цагаан текст үүн дээр 5.9:1.
  static const Color primary = cyanInk;
  static const Color primaryDark = cyanInkHover;
  static const Color primaryLight = Color(0xFFFDE7EF);

  // Эмнэлзүйн төлөв — семантик нь хэвээр, контраст шалгасан.
  static const Color danger = Color(0xFFB3261E);
  static const Color dangerLight = Color(0xFFFCE8E6);
  static const Color warning = Color(0xFFB8860B);
  static const Color warningLight = Color(0xFFFDF6E3);
  static const Color success = Color(0xFF2E7D5B);
  static const Color successLight = Color(0xFFE6F4EE);

  /// Мэдээллийн өнгө — логоны цэнхэр тал. Ягаанаас ялгаатай байх ёстой:
  /// "мэдээлэл" нь "үйлдэл" мэт харагдах ёсгүй.
  static const Color info = Color(0xFF0A6C96);
  static const Color infoLight = Color(0xFFE7F2F8);

  // Гадаргуу — гэрэл
  static const Color background = canvas;
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceAlt = Color(0xFFFFF0F4);
  static const Color border = hairline;

  // Гадаргуу — харанхуй. Ягаан гэр бүлийн дулаан бараан туйл.
  static const Color backgroundDark = Color(0xFF151014);
  static const Color surfaceDark = Color(0xFF1F181D);
  static const Color surfaceAltDark = Color(0xFF2A2127);
  static const Color borderDark = Color(0xFF3A2D35);

  // Текст — гэрэл
  static const Color textPrimary = ink;
  static const Color textSecondary = inkDim;
  static const Color textMuted = Color(0xFF9A8D95);

  // Текст — харанхуй
  static const Color textPrimaryDark = Color(0xFFF3ECEF);
  static const Color textSecondaryDark = Color(0xFFBFB0B8);
  static const Color textMutedDark = Color(0xFF8E7F87);

  /// Хэмжилтийн график дээрх шугамууд.
  ///
  /// Вебийн "Даралт хяналт" графиктай ижил — өвчтөн хоёр гадаргуу дээр нэг
  /// л график хардаг тул өнгө нь салах ёсгүй. Дизайны шинэчлэлд хамаарахгүй.
  static const Color chartSystolic = Color(0xFF1976D2);
  static const Color chartDiastolic = Color(0xFF0A6C96);
  static const Color chartPulse = Color(0xFFFF9800);
  static const Color chartWeight = Color(0xFF4CAF50);
  static const Color chartSpo2 = Color(0xFF9C27B0);

  // ------------------------------------------------ модулийн дүрсний өнгө
  /// Нүүрний хавтангийн дүрсний бөмбөлөг — HeartFit-ийн "Export Data" тор.
  /// Өнгө бүр модулийг ялгана, эмнэлзүйн утгагүй. Бөмбөлгийн дэвсгэр нь
  /// өнгөний 12%, дүрс өөрөө бүтэн өнгөөр.
  static const Color tileRose = Color(0xFFE0306A);
  static const Color tileBlue = Color(0xFF2F7FD8);
  static const Color tileViolet = Color(0xFF7B5CE0);
  static const Color tileTeal = Color(0xFF14A38B);
  static const Color tileAmber = Color(0xFFE8912D);
  static const Color tileCoral = Color(0xFFF0564A);
  static const Color tileIndigo = Color(0xFF4F5BD5);
  static const Color tileGreen = Color(0xFF3FA34D);
}
