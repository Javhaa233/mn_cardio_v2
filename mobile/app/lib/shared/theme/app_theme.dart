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

  /// Булангийн радиус — HeartFit маягийн зөөлөн, том бөөрөнхий.
  ///
  /// Шатлал нь хэвээр: контрол картаасаа бага радиустай тул картын дотор
  /// сууж буй контрол хоёр дахь карт мэт биш, контрол мэт харагдана.
  static const double cardRadius = 20;
  static const double controlRadius = 14;
  /// Нүүрний градиент хавтан зэрэг том гадаргуу.
  static const double heroRadius = 24;
  /// Харилцах цонх, доороос гарах хуудас.
  static const double sheetRadius = 28;
  static const double gap = 16; // space.4

  /// Сүүдэр нь **ягаан өнгөөр** будагдана, хэзээ ч саарал хар биш.
  /// Хуудасны өнгөний температуртай нийцсэн сүүдэр гүн мэт харагддаг;
  /// дулаан дэвсгэр дээрх саарал-хар сүүдэр бохир мэт харагддаг.
  static const Color shadowInk = Color(0x1FB0164F);

  /// Карт, хавтангийн зөөлөн сүүдэр — HeartFit-ийн "хөвж буй" карт.
  static const List<BoxShadow> softShadow = <BoxShadow>[
    BoxShadow(color: Color(0x14B0164F), blurRadius: 18, offset: Offset(0, 6)),
  ];

  static ThemeData light() => _build(Brightness.light);

  static ThemeData dark() => _build(Brightness.dark);

  static ThemeData _build(Brightness brightness) {
    final isDark = brightness == Brightness.dark;

    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: brightness,
    ).copyWith(
      primary: isDark ? const Color(0xFFFF7AA2) : AppColors.primary,
      onPrimary: isDark ? const Color(0xFF3A0A1E) : Colors.white,
      primaryContainer: isDark ? const Color(0xFF5A1733) : AppColors.primaryLight,
      onPrimaryContainer: isDark ? const Color(0xFFFFD9E4) : AppColors.cyanInkHover,
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

      // HeartFit: гарчиг голлосон, самбар нь хуудастайгаа нэг өнгөтэй тул
      // дэлгэц нэг ширхэг гадаргуу мэт харагдана.
      appBarTheme: AppBarTheme(
        backgroundColor:
            isDark ? AppColors.backgroundDark : AppColors.background,
        foregroundColor: textColor,
        elevation: 0,
        scrolledUnderElevation: 0,
        surfaceTintColor: Colors.transparent,
        centerTitle: true,
        titleTextStyle: TextStyle(
          color: textColor,
          fontSize: 18,
          fontWeight: FontWeight.w700,
          height: 1.3,
        ),
        systemOverlayStyle:
            isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      ),

      cardTheme: CardThemeData(
        color: surfaceColor,
        // Хүрээгүй цагаан карт, зөөлөн ягаан сүүдэр. Харанхуй горимд сүүдэр
        // харагдахгүй тул оронд нь үсэн хүрээ.
        elevation: isDark ? 0 : 3,
        shadowColor: const Color(0x33B0164F),
        surfaceTintColor: Colors.transparent,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(cardRadius),
          side: isDark ? BorderSide(color: borderColor) : BorderSide.none,
        ),
      ),

      dividerTheme: DividerThemeData(
        color: borderColor,
        thickness: 1,
        space: 1,
      ),

      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: isDark ? AppColors.surfaceAltDark : Colors.white,
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
          minimumSize: const Size.fromHeight(54),
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
          shape: const StadiumBorder(),
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
            height: 1.25,
          ),
        ),
      ),

      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          minimumSize: const Size.fromHeight(54),
          padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 14),
          foregroundColor: scheme.primary,
          side: BorderSide(color: scheme.primary.withValues(alpha: 0.45)),
          shape: const StadiumBorder(),
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

      // Доод цэсийг бүрхүүл өөрөө зурна (`shared/widgets/heart_nav_bar.dart`).
      // Энэ сэдэв нь NavigationBar-ыг шууд хэрэглэсэн үлдсэн газруудад.
      navigationBarTheme: NavigationBarThemeData(
        backgroundColor: surfaceColor,
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
            color: selected ? scheme.primary : mutedColor,
          );
        }),
        labelTextStyle: WidgetStateProperty.resolveWith((Set<WidgetState> states) {
          final selected = states.contains(WidgetState.selected);
          return TextStyle(
            fontSize: 11.5,
            height: 1.2,
            fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
            color: selected ? scheme.primary : mutedColor,
          );
        }),
      ),

      snackBarTheme: SnackBarThemeData(
        behavior: SnackBarBehavior.floating,
        backgroundColor: isDark ? AppColors.surfaceAltDark : const Color(0xFF2B2228),
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

      floatingActionButtonTheme: FloatingActionButtonThemeData(
        backgroundColor: scheme.primary,
        foregroundColor: Colors.white,
        elevation: 4,
        shape: const StadiumBorder(),
      ),

      tabBarTheme: TabBarThemeData(
        labelColor: scheme.primary,
        unselectedLabelColor: mutedColor,
        indicatorColor: scheme.primary,
        indicatorSize: TabBarIndicatorSize.label,
        dividerColor: Colors.transparent,
        labelStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700),
        unselectedLabelStyle:
            const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
      ),

      segmentedButtonTheme: SegmentedButtonThemeData(
        style: SegmentedButton.styleFrom(
          selectedBackgroundColor: AppColors.primaryLight,
          selectedForegroundColor: AppColors.cyanInkHover,
          shape: const StadiumBorder(),
        ),
      ),

      switchTheme: SwitchThemeData(
        thumbColor: WidgetStateProperty.resolveWith((Set<WidgetState> s) =>
            s.contains(WidgetState.selected) ? Colors.white : null),
        trackColor: WidgetStateProperty.resolveWith((Set<WidgetState> s) =>
            s.contains(WidgetState.selected) ? scheme.primary : null),
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
            fontWeight: FontWeight.w800,
            height: 1.25,
          ),
          // h3 — картны гарчиг
          titleLarge: base.titleLarge?.copyWith(
            fontSize: 18,
            fontWeight: FontWeight.w700,
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
