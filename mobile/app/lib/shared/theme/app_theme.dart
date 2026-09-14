import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'app_colors.dart';

/// Апп-ын харагдах байдал.
///
/// Монгол шошго англи эквивалентаасаа мэдэгдэхүйц урт байдаг тул мөрийн өндөр,
/// товчны доторх зай зэргийг өгөөмөр авсан — өөрөөр бол UAT дээр текст таслагдаж
/// эхэлнэ (FLUTTER.md § "Mongolian UI").
class AppTheme {
  AppTheme._();

  /// Булангийн радиус — зөвхөн мобайл.
  ///
  /// Вебийн `tokens.js` (карт 6px, контрол 3px) гар утсан дээр хурц өнцөгтэй
  /// харагдаж байсан тул мобайл дээр бөөрөнхий булантай болгов. Вебийг
  /// өөрчлөөгүй. Шатлал нь хэвээр: контрол картаасаа бага радиустай тул
  /// картын дотор сууж буй контрол хоёр дахь карт мэт биш, контрол мэт
  /// харагдана.
  static const double cardRadius = 16;
  static const double controlRadius = 12;
  /// Нүүрний градиент хавтан зэрэг том гадаргуу.
  static const double heroRadius = 20;
  /// Харилцах цонх, доороос гарах хуудас.
  static const double sheetRadius = 24;
  static const double gap = 16; // space.4

  /// Сүүдэр нь **бэхний navy өнгөөр** будагдана, хэзээ ч саарал хар биш
  /// (`tokens.js` § `elevation`). Хуудасны өнгөний температуртай нийцсэн
  /// сүүдэр гүн мэт харагддаг; хүйтэн дэвсгэр дээрх саарал-хар сүүдэр
  /// бохир мэт харагддаг.
  static const Color shadowInk = Color(0x1A0D3A5C);

  static ThemeData light() => _build(Brightness.light);

  static ThemeData dark() => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final isDark = brightness == Brightness.dark;

    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: brightness,
    ).copyWith(
      primary: isDark ? const Color(0xFF4FC3F0) : AppColors.primary,
      // ЗӨВХӨН ТЕКСТ БУС — заагч, хүрээ, том дүрсэд.
      secondary: AppColors.cyan,
      surface: isDark ? AppColors.surfaceDark : AppColors.surface,
      error: AppColors.danger,
    );

    final textColor = isDark ? AppColors.textPrimaryDark : AppColors.textPrimary;
    final mutedColor =
        isDark ? AppColors.textSecondaryDark : AppColors.textSecondary;
    final borderColor = isDark ? AppColors.borderDark : AppColors.border;
    final surfaceColor = isDark ? AppColors.surfaceDark : AppColors.surface;

    final base = ThemeData(
      useMaterial3: true,
      brightness: brightness,
      colorScheme: scheme,
      scaffoldBackgroundColor:
          isDark ? AppColors.backgroundDark : AppColors.background,
      splashFactory: InkSparkle.splashFactory,
    );

    return base.copyWith(
      textTheme: _textTheme(base.textTheme, textColor, mutedColor),

      appBarTheme: AppBarTheme(
        backgroundColor: surfaceColor,
        foregroundColor: textColor,
        elevation: 0,
        scrolledUnderElevation: 1,
        centerTitle: false,
        titleTextStyle: TextStyle(
          color: textColor,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          height: 1.3,
        ),
        systemOverlayStyle:
            isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      ),

      cardTheme: CardThemeData(
        color: surfaceColor,
        // elevation.1 — `0 1px 2px rgba(13,58,92,0.06)`.
        elevation: isDark ? 0 : 1,
        shadowColor: shadowInk,
        surfaceTintColor: Colors.transparent,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(cardRadius),
          side: BorderSide(color: borderColor),
        ),
      ),

      dividerTheme: DividerThemeData(
        color: borderColor,
        thickness: 1,
        space: 1,
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? AppColors.surfaceAltDark : AppColors.surfaceAlt,
        // Монгол шошго урт тул доторх зайг өгөөмөр авав.
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(controlRadius),
          borderSide: BorderSide(color: borderColor),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(controlRadius),
          borderSide: BorderSide(color: borderColor),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(controlRadius),
          borderSide: BorderSide(color: scheme.primary, width: 1.6),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(controlRadius),
          borderSide: const BorderSide(color: AppColors.danger),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(controlRadius),
          borderSide: const BorderSide(color: AppColors.danger, width: 1.6),
        ),
        labelStyle: TextStyle(color: mutedColor, height: 1.2),
        floatingLabelStyle: TextStyle(color: scheme.primary),
        hintStyle: TextStyle(
          color: isDark ? AppColors.textMutedDark : AppColors.textMuted,
        ),
        errorStyle: const TextStyle(color: AppColors.danger, height: 1.3),
      ),

      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(controlRadius),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            height: 1.25,
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(52),
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
          side: BorderSide(color: borderColor),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(controlRadius),
          ),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            height: 1.25,
          ),
        ),
      ),

      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          textStyle: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            height: 1.25,
          ),
        ),
      ),

      chipTheme: ChipThemeData(
        backgroundColor: isDark ? AppColors.surfaceAltDark : AppColors.surfaceAlt,
        selectedColor: isDark
            ? scheme.primary.withValues(alpha: 0.24)
            : AppColors.primaryLight,
        side: BorderSide(color: borderColor),
        labelStyle: TextStyle(
          color: textColor,
          fontSize: 14,
          fontWeight: FontWeight.w500,
          height: 1.2,
        ),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(999),
        ),
      ),

      listTileTheme: ListTileThemeData(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        iconColor: mutedColor,
        titleTextStyle: TextStyle(
          color: textColor,
          fontSize: 16,
          fontWeight: FontWeight.w500,
          height: 1.35,
        ),
        subtitleTextStyle: TextStyle(
          color: mutedColor,
          fontSize: 14,
          height: 1.4,
        ),
      ),

      bottomNavigationBarTheme: BottomNavigationBarThemeData(
        backgroundColor: surfaceColor,
        selectedItemColor: scheme.primary,
        unselectedItemColor: mutedColor,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: const TextStyle(
          fontSize: 11.5,
          fontWeight: FontWeight.w600,
        ),
        unselectedLabelStyle: const TextStyle(fontSize: 11.5),
      ),

      // Гар утсан дээр вебийн хажуугийн цэс байхгүй тул брэндийн градиент
      // хаана ч гарахгүй байв — тийм ч учраас апп зурган дээрхтэй адилгүй
      // санагдаж байсан. Доод цэс бол мобайл дээрх түүний дүйцэл: ижил
      // градиент, цагаан бичиг, сонгогдсон мөр нь цагаан тунгалаг товгор.
      //
      // Дэвсгэрийг бүрхүүл өөрөө зурна (`main_shell` / `doctor_shell`), тул
      // энд тунгалаг.
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: Colors.transparent,
        surfaceTintColor: Colors.transparent,
        shadowColor: Colors.transparent,
        indicatorColor: AppColors.navSelected,
        indicatorShape: const StadiumBorder(),
        elevation: 0,
        height: 68,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        iconTheme: WidgetStateProperty.resolveWith((Set<WidgetState> states) {
          final selected = states.contains(WidgetState.selected);
          return IconThemeData(
            size: 24,
            color: selected ? Colors.white : Colors.white.withValues(alpha: 0.82),
          );
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((Set<WidgetState> states) {
          final selected = states.contains(WidgetState.selected);
          return TextStyle(
            fontSize: 11.5,
            height: 1.2,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
            color: selected ? Colors.white : Colors.white.withValues(alpha: 0.82),
          );
        }),
      ),

      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: isDark ? AppColors.surfaceAltDark : const Color(0xFF25313D),
        contentTextStyle: const TextStyle(
          color: Colors.white,
          fontSize: 14.5,
          height: 1.4,
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(cardRadius),
        ),
      ),

      dialogTheme: DialogThemeData(
        backgroundColor: surfaceColor,
        shadowColor: shadowInk,
        surfaceTintColor: Colors.transparent,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(sheetRadius),
        ),
        titleTextStyle: TextStyle(
          color: textColor,
          fontSize: 18,
          fontWeight: FontWeight.w600,
          height: 1.35,
        ),
        contentTextStyle: TextStyle(
          color: mutedColor,
          fontSize: 15,
          height: 1.45,
        ),
      ),

      bottomSheetTheme: BottomSheetThemeData(
        backgroundColor: surfaceColor,
        surfaceTintColor: Colors.transparent,
        shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(sheetRadius)),
        ),
        showDragHandle: true,
      ),

      progressIndicatorTheme: ProgressIndicatorThemeData(
        color: scheme.primary,
        linearMinHeight: 3,
      ),
    );
  }

  static TextTheme _textTheme(
    TextTheme base,
    Color textColor,
    Color mutedColor,
  ) {
    // height 1.35+ — кирилл үсгийн уншигдах байдалд шаардлагатай.
    return base
        .copyWith(
          // h2
          headlineSmall: base.headlineSmall?.copyWith(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            height: 1.25,
          ),
          // h3 — картны гарчиг
          titleLarge: base.titleLarge?.copyWith(
            fontSize: 18,
            fontWeight: FontWeight.w600,
            height: 1.3,
          ),
          // h4
          titleMedium: base.titleMedium?.copyWith(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            height: 1.35,
          ),
          // h5
          titleSmall: base.titleSmall?.copyWith(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            height: 1.4,
          ),
          // body1
          bodyLarge: base.bodyLarge?.copyWith(fontSize: 16, height: 1.55),
          // body2 — веб 14, кирилл уншигдахад 14.5. Ялгаа нүдэнд мэдэгдэхгүй.
          bodyMedium: base.bodyMedium?.copyWith(fontSize: 14.5, height: 1.5),
          // caption
          bodySmall: base.bodySmall?.copyWith(
            fontSize: 12.5,
            height: 1.45,
            color: mutedColor,
          ),
          labelLarge: base.labelLarge?.copyWith(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            height: 1.25,
          ),
        )
        .apply(bodyColor: textColor, displayColor: textColor);
  }
}
