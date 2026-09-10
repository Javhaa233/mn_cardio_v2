import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Богино мэдэгдэл. Бүх текст монгол.
class AppSnack {
  AppSnack._();

  static void success(BuildContext context, String message) =>
      _show(context, message, AppColors.success, Icons.check_circle_outline);

  static void error(BuildContext context, String message) =>
      _show(context, message, AppColors.danger, Icons.error_outline_rounded);

  static void info(BuildContext context, String message) =>
      _show(context, message, AppColors.info, Icons.info_outline_rounded);

  /// Дэлгэц хаагдсаны дараа мэдэгдэл харуулах хэрэгтэй үед: маршрут хаагдахаас
  /// **өмнө** `ScaffoldMessenger.of(context)`-ыг барьж аваад энд дамжуулна.
  /// `BuildContext` нь маршруттайгаа хамт хүчингүй болдог.
  static void successOn(ScaffoldMessengerState messenger, String message) =>
      _showOn(messenger, message, AppColors.success, Icons.check_circle_outline);

  static void infoOn(ScaffoldMessengerState messenger, String message) =>
      _showOn(messenger, message, AppColors.info, Icons.info_outline_rounded);

  static void errorOn(ScaffoldMessengerState messenger, String message) =>
      _showOn(messenger, message, AppColors.danger, Icons.error_outline_rounded);

  static void _show(
    BuildContext context,
    String message,
    Color color,
    IconData icon,
  ) {
    final messenger = ScaffoldMessenger.maybeOf(context);
    if (messenger == null) return;
    _showOn(messenger, message, color, icon);
  }

  static void _showOn(
    ScaffoldMessengerState messenger,
    String message,
    Color color,
    IconData icon,
  ) {
    messenger
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          duration: const Duration(seconds: 4),
          content: Row(
            children: <Widget>[
              Icon(icon, color: color, size: 20),
              const SizedBox(width: 10),
              Expanded(child: Text(message)),
            ],
          ),
        ),
      );
  }
}

/// Баталгаажуулах харилцах цонх.
Future<bool> confirmDialog(
  BuildContext context, {
  required String title,
  required String message,
  String confirmLabel = 'Тийм',
  String cancelLabel = 'Болих',
  bool destructive = false,
}) async {
  final result = await showDialog<bool>(
    context: context,
    builder: (BuildContext ctx) => AlertDialog(
      title: Text(title),
      content: Text(message),
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(false),
          child: Text(cancelLabel),
        ),
        FilledButton(
          onPressed: () => Navigator.of(ctx).pop(true),
          style: destructive
              ? FilledButton.styleFrom(backgroundColor: AppColors.danger)
              : null,
          child: Text(confirmLabel),
        ),
      ],
    ),
  );
  return result ?? false;
}
