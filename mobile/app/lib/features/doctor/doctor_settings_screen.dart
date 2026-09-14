import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/config/app_config.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_licenses.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/section_card.dart';
import '../auth/server_settings_sheet.dart';
import '../auth/terms_screen.dart';
import 'doctor_advice_screen.dart';
import 'doctor_controllers.dart';
import 'doctor_patients_screen.dart';
import 'doctor_report_screen.dart';

/// Эмчийн цэс.
class DoctorSettingsScreen extends StatefulWidget {
  const DoctorSettingsScreen({super.key});

  @override
  State<DoctorSettingsScreen> createState() => _DoctorSettingsScreenState();
}

class _DoctorSettingsScreenState extends State<DoctorSettingsScreen> {
  String _version = '';

  @override
  void initState() {
    super.initState();
    _loadVersion();
  }

  Future<void> _loadVersion() async {
    try {
      final info = await PackageInfo.fromPlatform();
      if (!mounted) return;
      setState(() => _version = '${info.version} (${info.buildNumber})');
    } catch (_) {
      // Хувилбарын мэдээлэл заавал биш.
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final me = context.watch<DoctorProfileController>().me;
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Цэс')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: <Widget>[
          SectionCard(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: <Widget>[
                CircleAvatar(
                  radius: 26,
                  backgroundColor:
                      theme.colorScheme.primary.withValues(alpha: 0.12),
                  child: Text(
                    me?.initials ?? '—',
                    style: theme.textTheme.titleMedium?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        me?.fullName ?? auth.user?.displayName ?? 'Эмч',
                        style: theme.textTheme.titleSmall,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        <String>[
                          if (me != null) me.roleLabel,
                          if (me?.organizationName?.trim().isNotEmpty == true)
                            me!.organizationName!.trim(),
                        ].join(' · '),
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (me != null && (me.email ?? '').trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            SectionCard(
              title: 'Холбоо барих',
              icon: Icons.mail_outline_rounded,
              child: Column(
                children: <Widget>[
                  InfoRow(label: 'Имэйл', value: me.email ?? ''),
                  InfoRow(label: 'Байршил', value: me.location),
                ],
              ),
            ),
          ],
          const SizedBox(height: 12),
          SectionCard(
            title: 'Хурдан холбоос',
            icon: Icons.dashboard_outlined,
            padding: const EdgeInsets.fromLTRB(16, 16, 8, 8),
            child: Column(
              children: <Widget>[
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.tips_and_updates_outlined),
                  title: const Text('Миний зөвлөгөө'),
                  trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                  onTap: () => _push(const DoctorAdviceScreen()),
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.insights_outlined),
                  title: const Text('Миний тайлан'),
                  trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                  onTap: () => _push(const DoctorReportScreen()),
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.person_search_outlined),
                  title: const Text('Үйлчлүүлэгч хайх'),
                  trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                  onTap: () => _push(const DoctorPatientsScreen()),
                ),
              ],
            ),
          ),
          const SizedBox(height: 12),
          SectionCard(
            title: 'Тохиргоо',
            icon: Icons.settings_outlined,
            padding: const EdgeInsets.fromLTRB(16, 16, 8, 8),
            child: Column(
              children: <Widget>[
                SwitchListTile(
                  value: auth.biometricEnabled,
                  onChanged: auth.biometricAvailable
                      ? (bool value) => _setBiometric(value)
                      : null,
                  contentPadding: EdgeInsets.zero,
                  title: const Text('Хурууны хээгээр нэвтрэх'),
                  subtitle: Text(
                    auth.biometricAvailable
                        ? 'Апп нээхэд нууц үгийн оронд таниулна'
                        : 'Төхөөрөмж дээр хурууны хээ тохируулаагүй байна',
                  ),
                ),
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.gavel_outlined),
                  title: const Text('Үйлчилгээний нөхцөл'),
                  trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                  onTap: () => _push(const TermsScreen()),
                ),
                AppLicensesTile(version: _version),
                if (_version.isNotEmpty)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.tag_rounded),
                    title: const Text('Хувилбар'),
                    trailing:
                        Text(_version, style: theme.textTheme.bodySmall),
                  ),
                if (AppConfig.canOverrideBaseUrl)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.dns_outlined),
                    title: const Text('Серверийн хаяг'),
                    subtitle: Text(
                      AppConfig.baseUrl,
                      style: theme.textTheme.bodySmall,
                    ),
                    trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                    onTap: () => showModalBottomSheet<void>(
                      context: context,
                      isScrollControlled: true,
                      builder: (_) => const ServerSettingsSheet(),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 18),
          OutlinedButton.icon(
            onPressed: _logout,
            icon: const Icon(Icons.logout_rounded),
            label: const Text('Гарах'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.danger,
              side: BorderSide(color: AppColors.danger.withValues(alpha: 0.4)),
            ),
          ),
        ],
      ),
    );
  }

  void _push(Widget screen) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => screen),
    );
  }

  Future<void> _setBiometric(bool value) async {
    final auth = context.read<AuthController>();
    await auth.setBiometricEnabled(value);
    if (!mounted) return;
    if (auth.lastError != null && value) {
      AppSnack.error(context, auth.lastError!);
    }
  }

  Future<void> _logout() async {
    final confirmed = await confirmDialog(
      context,
      title: 'Гарах',
      message: 'Та системээс гарахдаа итгэлтэй байна уу?',
      confirmLabel: 'Гарах',
      destructive: true,
    );
    if (!confirmed || !mounted) return;
    await context.read<AuthController>().logout();
  }
}
