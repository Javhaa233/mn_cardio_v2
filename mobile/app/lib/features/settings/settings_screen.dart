import 'package:flutter/material.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/config/app_config.dart';
import '../../core/notifications/reminder_controller.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_licenses.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/section_card.dart';
import '../auth/server_settings_sheet.dart';
import '../auth/terms_screen.dart';
import '../profile/profile_controller.dart';
import '../profile/profile_screen.dart';
import '../reminders/reminders_screen.dart';

/// Цэс — профайл, тохиргоо, гарах.
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
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
      // Хувилбарын мэдээлэл нь заавал биш.
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final profile = context.watch<ProfileController>().profile;
    final reminders = context.watch<ReminderController>();
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Цэс')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: <Widget>[
          SectionCard(
            onTap: () => Navigator.of(context).push(
              MaterialPageRoute<void>(builder: (_) => const ProfileScreen()),
            ),
            padding: const EdgeInsets.fromLTRB(16, 16, 12, 16),
            child: Row(
              children: <Widget>[
                CircleAvatar(
                  radius: 26,
                  backgroundColor:
                      theme.colorScheme.primary.withValues(alpha: 0.12),
                  child: Text(
                    profile?.initials ?? '—',
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
                        profile?.fullName ??
                            auth.user?.displayName ??
                            'Миний бүртгэл',
                        style: theme.textTheme.titleSmall,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        'Миний бүртгэлийг харах',
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right_rounded, size: 20),
              ],
            ),
          ),
          const SizedBox(height: 14),
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
                  leading: const Icon(Icons.notifications_none_rounded),
                  title: const Text('Сануулга'),
                  subtitle: Text(
                    reminders.reminders.isEmpty
                        ? 'Эм уух, дасгал хийх, үзлэгийн цаг'
                        : '${reminders.reminders.length} сануулга тохируулсан',
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => const RemindersScreen(),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Аппын тухай',
            icon: Icons.info_outline_rounded,
            padding: const EdgeInsets.fromLTRB(16, 16, 8, 8),
            child: Column(
              children: <Widget>[
                ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.gavel_outlined),
                  title: const Text('Үйлчилгээний нөхцөл'),
                  trailing: const Icon(Icons.chevron_right_rounded, size: 20),
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute<void>(builder: (_) => const TermsScreen()),
                  ),
                ),
                AppLicensesTile(version: _version),
                if (_version.isNotEmpty)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: const Icon(Icons.tag_rounded),
                    title: const Text('Хувилбар'),
                    trailing: Text(
                      _version,
                      style: theme.textTheme.bodySmall,
                    ),
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

    // Сервер токеныг хүчингүй болгодоггүй тул гарах гэдэг нь бүхэлдээ
    // клиент талын үйлдэл: хадгалалтыг цэвэрлэх (API.md §2).
    context.read<ProfileController>().clear();
    await context.read<AuthController>().logout();
  }
}
