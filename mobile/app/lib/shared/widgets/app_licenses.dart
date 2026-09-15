import 'package:flutter/material.dart';

/// Техникийн шаардлага §1.1 — "Программ хангамж ... ашиглаж буй бүрэлдэхүүн
/// хэсгүүд нь оюуны өмч, зохиогчийн эрхийн зөрчилгүй байх".
///
/// Аппад орсон бүх нээлттэй эхийн сангийн лицензийг Flutter build хийх үед
/// өөрөө цуглуулдаг (`LicenseRegistry`), тиймээс жагсаалт гараар хөтлөгдөхгүй,
/// сан нэмэгдэхэд хоцрохгүй.
class AppLicensesTile extends StatelessWidget {
  const AppLicensesTile({super.key, required this.version});

  final String version;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: const Icon(Icons.copyright_outlined),
      title: const Text('Нээлттэй эхийн лиценз'),
      trailing: const Icon(Icons.chevron_right_rounded, size: 20),
      onTap: () => showLicensePage(
        context: context,
        applicationName: 'МнКардио',
        applicationVersion: version,
        applicationIcon: Padding(
          padding: const EdgeInsets.all(12),
          child: Image.asset('assets/logo.png', width: 64, height: 64),
        ),
        applicationLegalese: '© Зүрх судасны үндэсний төв. Гүйцэтгэгч: ITsystem.',
      ),
    );
  }
}
