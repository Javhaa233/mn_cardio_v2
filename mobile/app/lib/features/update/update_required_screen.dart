import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../core/update/update_controller.dart';
import '../../shared/widgets/app_snack.dart';

/// Техникийн шаардлага §2.1 — сервер дэмжихээ больсон хувилбарыг зогсооно.
///
/// Апп дотор шинэчлэлт татдаггүй (дэлгүүр өөрөө хийнэ), гэхдээ хуучин билдээр
/// эмнэлгийн өгөгдөл рүү хандахыг зогсооно: API өөрчлөгдсөн байвал хуучин апп
/// буруу мэдээлэл харуулж болзошгүй.
class UpdateRequiredScreen extends StatelessWidget {
  const UpdateRequiredScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final updates = context.watch<UpdateController>();
    final info = updates.info;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Image.asset(
                  'assets/logo.png',
                  width: 88,
                  height: 88,
                  semanticLabel: 'МнКардио',
                ),
                const SizedBox(height: 24),
                Text(
                  'Аппаа шинэчилнэ үү',
                  style: theme.textTheme.titleLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  'Таны ашиглаж буй хувилбарыг сервер дэмжихээ больсон байна. '
                  'Мэдээлэл зөв харагдахын тулд дэлгүүрээс шинэ хувилбарыг '
                  'суулгана уу.',
                  style: theme.textTheme.bodyMedium?.copyWith(height: 1.5),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 18),
                if (updates.version != null)
                  Text(
                    'Таны хувилбар: ${updates.version} (${updates.build ?? '—'})'
                    '${info?.latestVersion == null ? '' : '\nШинэ хувилбар: ${info!.latestVersion}'}',
                    style: theme.textTheme.bodySmall,
                    textAlign: TextAlign.center,
                  ),
                if (info?.releaseNotes != null) ...<Widget>[
                  const SizedBox(height: 14),
                  Text(
                    info!.releaseNotes!,
                    style: theme.textTheme.bodySmall?.copyWith(height: 1.5),
                    textAlign: TextAlign.center,
                  ),
                ],
                const SizedBox(height: 24),
                if (info?.storeUrl != null && info!.storeUrl!.isNotEmpty)
                  FilledButton.icon(
                    onPressed: () async {
                      await Clipboard.setData(
                        ClipboardData(text: info.storeUrl!),
                      );
                      if (!context.mounted) return;
                      AppSnack.success(context, 'Холбоосыг хууллаа.');
                    },
                    icon: const Icon(Icons.copy_rounded),
                    label: const Text('Дэлгүүрийн холбоосыг хуулах'),
                  )
                else
                  Text(
                    'Play Store эсвэл App Store-оос "МнКардио" гэж хайна уу.',
                    style: theme.textTheme.bodySmall,
                    textAlign: TextAlign.center,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
