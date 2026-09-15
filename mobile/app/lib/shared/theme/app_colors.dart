import 'package:flutter/material.dart';

/// Өнгөний тогтолцоо.
///
/// Утгууд нь вебийн брэнд токенуудаас шууд авсан —
/// `frontend/src/theme/colors.js` § `brand`. Хоёр гадаргуу нэг бүтээгдэхүүн
/// мэт харагдах ёстой тул энд шинэ өнгө зохиогоогүй: вебэд аль хэдийн
/// шийдэгдсэн өнгийг давхардуулан бичсэн. Веб дээрх утга өөрчлөгдвөл энд ч
/// хамт өөрчилнө.
///
/// **КОНТРАСТЫН ДҮРЭМ — вебээс хамт ирсэн, сонголт биш.**
/// [cyan] (#18a8e8) цагаан дээр ~2.5:1, [cyanDeep] (#0096c9) ~3.0:1. Хоёулаа
/// текстэд WCAG AA-г унана. Тиймээс:
///   * [cyan] / [cyanDeep] — **зөвхөн текст бус**: заагч зурвас, хүрээ,
///     графикийн шугам, 24px-ээс том дүрс.
///   * [cyanInk] (#0a6c96) — **үг болох бүх зүйл**. Цагаан дээр 5.84:1.
///     Контраст тэгш хэмтэй тул дүүргэсэн товчин дээрх цагаан текст ч тэнцэнэ.
/// Эмч бүтэн ээлж эдгээр дэлгэцийг уншина — тэр төсвийг үрэхгүй.
///
/// Улаан өнгө нь **зөвхөн эмнэлзүйн анхааруулгад** үлдсэн: бүх товч улаан
/// байвал жинхэнэ анхааруулга нүдэнд торохоо больдог.
class AppColors {
  AppColors._();

  // ---------------------------------------------------------------- брэнд
  // Бэх — LoginScene --ink / --ink-dim
  static const Color ink = Color(0xFF0C2233);
  static const Color inkDim = Color(0xFF5E7688);

  /// Өнгөт (цагаан бус) гадаргуу дээрх хоёрдогч текст. [inkDim] нь цагаан
  /// дээр 4.75:1 боловч [canvas] дээр 3.86:1 болж унадаг; энэ нь 5.97:1.
  static const Color inkMuted = Color(0xFF3F5A6B);

  /// ЗӨВХӨН ТЕКСТ БУС. Дээрх контрастын дүрмийг үзнэ үү.
  static const Color cyan = Color(0xFF18A8E8);

  /// ЗӨВХӨН ТЕКСТ БУС.
  static const Color cyanDeep = Color(0xFF0096C9);

  /// Текст ба дүүргэсэн товчны AA-тэнцэх шат.
  static const Color cyanInk = Color(0xFF0A6C96);
  static const Color cyanInkHover = Color(0xFF085678);

  /// Хажуугийн цэсийн градиентын эхлэл. Зөвхөн градиент дотор.
  static const Color indigo = Color(0xFF4034D6);

  /// Брэндийн градиент: `135deg, #4034D6 → #0096C9`.
  static const LinearGradient brandGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: <Color>[indigo, cyanDeep],
  );

  /// Цэсний градиент — вебийн `sidebarStyle.blueBackground`, өөрөөр хэлбэл
  /// [brandGradient]-ийг `180deg` болгосон нь. Вебэд цэс нь босоо баганад
  /// сууж, дээрээ индиго, доошоо цэнхэр болдог. Гар утсанд цэс доор хэвтээ
  /// байрлах тул чиглэлийг нь хэвээр — дээрээс доош — үлдээв: хэрэглэгч ижил
  /// өнгөний шилжилтийг хардаг.
  static const LinearGradient navGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: <Color>[indigo, cyanDeep],
  );

  /// Сонгогдсон цэсний товгор — вебийн цагаан 16%.
  static const Color navSelected = Color(0x29FFFFFF);

  /// Чат, аватар, илгээх товчны цэнхэр аялгуу — вебийн `status.accent`.
  ///
  /// ЗӨВХӨН ТЕКСТ БУС: цагаан дээр 2.7:1. Веб үүнийг чатын "Эмч" шошгонд
  /// текстээр хэрэглэдэг нь хүртээмжийн алдаа — түүнийг хуулаагүй.
  static const Color accent = Color(0xFF00ACC1);

  // ------------------------------------------------------------ гадаргуу
  /// Хуудасны дэвсгэр — LoginScene --bg-1.
  static const Color canvas = Color(0xFFEAF2F8);

  /// Hover угаалга, чип — LoginScene --ring, rgba(24,140,200,0.075).
  static const Color tint = Color(0x1318A8E8);

  /// Үсэн хүрээ — LoginScene --panel-line, rgba(13,58,92,0.13).
  static const Color hairline = Color(0x210D3A5C);
  static const Color hairlineStrong = Color(0x380D3A5C);

  static const Color focus = Color(0x8C18A8E8);

  /// Дэлгэц бүрт нэг л удаа, хамгийн яаралтай зүйлд.
  static const Color urgent = Color(0xFFEE147D);

  // ------------------------------------------- нэрийн тохирол (хуучин API)
  /// Үндсэн үйлдлийн өнгө — вебийн `button.primary`. Дэлгэцийн зураг дээрх
  /// "Шүүлтүүр" товч, чатын хөвөгч товч бүгд энэ.
  ///
  /// Цагаан дээр 4.63:1, цагаан текст үүн дээр мөн 4.63:1 — хоёр талдаа AA.
  static const Color primary = Color(0xFF1976D2);
  static const Color primaryDark = Color(0xFF1565C0);
  static const Color primaryLight = Color(0xFFE3F0FC);

  // Эмнэлзүйн төлөв — семантик нь хэвээр, контраст шалгасан.
  static const Color danger = Color(0xFFD64550);
  static const Color dangerLight = Color(0xFFFDECEE);
  static const Color warning = Color(0xFFB8860B);
  static const Color warningLight = Color(0xFFFDF6E3);
  static const Color success = Color(0xFF2E7D5B);
  static const Color successLight = Color(0xFFE6F4EE);
  static const Color info = cyanInk;
  static const Color infoLight = Color(0xFFE7F2F8);

  // Гадаргуу — гэрэл
  static const Color background = canvas;
  static const Color surface = Color(0xFFFFFFFF);
  static const Color surfaceAlt = Color(0xFFF1F6FA);
  static const Color border = hairline;

  // Гадаргуу — харанхуй. Вебэд харанхуй горим байхгүй тул эдгээрийг [ink]-ээс
  // гаргаж авав: ижил өнгөт гэр бүл, зүгээр л эсрэг туйл дээр.
  static const Color backgroundDark = Color(0xFF0B1620);
  static const Color surfaceDark = Color(0xFF12212D);
  static const Color surfaceAltDark = Color(0xFF1B2C3A);
  static const Color borderDark = Color(0xFF2A3F4F);

  // Текст — гэрэл
  static const Color textPrimary = ink;
  static const Color textSecondary = inkDim;
  static const Color textMuted = Color(0xFF8496A4);

  // Текст — харанхуй
  static const Color textPrimaryDark = Color(0xFFE6EEF5);
  static const Color textSecondaryDark = Color(0xFFA3B5C3);
  static const Color textMutedDark = Color(0xFF7C8E9C);

  /// Хэмжилтийн график дээрх шугамууд.
  ///
  /// Вебийн "Даралт хяналт" графиктай ижил: систол хөх, судасны цохилт улбар
  /// шар, жин ногоон. Өвчтөн хоёр гадаргуу дээр нэг л график хардаг тул өнгө
  /// нь салах ёсгүй.
  static const Color chartSystolic = Color(0xFF1976D2);
  static const Color chartDiastolic = cyanInk;
  static const Color chartPulse = Color(0xFFFF9800);
  static const Color chartWeight = Color(0xFF4CAF50);
  static const Color chartSpo2 = Color(0xFF9C27B0);
}
