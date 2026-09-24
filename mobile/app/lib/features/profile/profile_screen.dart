import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'patient_profile.dart';
import 'profile_controller.dart';

/// 2.1 Миний бүртгэл.
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  /// Регистрийн дугаарыг анхнаасаа далдалж, хэрэглэгч өөрөө нээнэ.
  bool _revealRegistration = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<ProfileController>();
      if (controller.state.isIdle) controller.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Миний бүртгэл')),
      body: Consumer<ProfileController>(
        builder: (BuildContext context, ProfileController controller, _) {
          final state = controller.state;

          if (state.isFirstLoad) {
            return const LoadingView(label: 'Бүртгэл уншиж байна…');
          }

          if (state.hasError && !state.hasData) {
            return ErrorView(
              error: state.error!,
              onRetry: () => controller.load(refresh: true),
            );
          }

          final profile = state.data;
          if (profile == null) {
            return const EmptyView(
              title: 'Бүртгэл олдсонгүй',
              message: 'Зүрх судасны үндэсний төвийн бүртгэлийн хэсэгт хандана уу.',
              icon: Icons.badge_outlined,
            );
          }

          return RefreshIndicator(
            onRefresh: () => controller.load(refresh: true),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
              children: <Widget>[
                _Header(profile: profile),
                const SizedBox(height: 16),
                _IdentityCard(
                  profile: profile,
                  revealed: _revealRegistration,
                  onToggleReveal: () => setState(() {
                    _revealRegistration = !_revealRegistration;
                  }),
                ),
                const SizedBox(height: 12),
                _ContactCard(profile: profile),
                const SizedBox(height: 12),
                _AddressCard(profile: profile),
                const SizedBox(height: 16),
                const _ReadOnlyNotice(),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _Header extends StatelessWidget {
  const _Header({required this.profile});

  final PatientProfile profile;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final age = profile.effectiveAge;

    return Row(
      children: <Widget>[
        Container(
          width: 62,
          height: 62,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: theme.colorScheme.primary.withValues(alpha: 0.12),
            shape: BoxShape.circle,
          ),
          child: Text(
            profile.initials,
            style: theme.textTheme.titleLarge?.copyWith(
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
              Text(profile.fullName, style: theme.textTheme.titleLarge),
              const SizedBox(height: 4),
              Text(
                <String>[
                  if (age != null) '$age настай',
                  if (profile.birthday != null)
                    MnFormat.date(profile.birthday),
                ].join(' · '),
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _IdentityCard extends StatelessWidget {
  const _IdentityCard({
    required this.profile,
    required this.revealed,
    required this.onToggleReveal,
  });

  final PatientProfile profile;
  final bool revealed;
  final VoidCallback onToggleReveal;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final registration = profile.registration.trim();

    return SectionCard(
      title: 'Хувийн мэдээлэл',
      icon: Icons.badge_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              SizedBox(
                width: 132,
                child: Text(
                  'Регистрийн дугаар',
                  style: theme.textTheme.bodySmall,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  registration.isEmpty
                      ? '—'
                      : (revealed ? registration : profile.maskedRegistration),
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
              if (registration.isNotEmpty) ...<Widget>[
                IconButton(
                  onPressed: onToggleReveal,
                  visualDensity: VisualDensity.compact,
                  tooltip: revealed ? 'Нуух' : 'Харах',
                  icon: Icon(
                    revealed
                        ? Icons.visibility_off_outlined
                        : Icons.visibility_outlined,
                    size: 20,
                  ),
                ),
                IconButton(
                  onPressed: () async {
                    await Clipboard.setData(
                      ClipboardData(text: registration),
                    );
                    if (context.mounted) {
                      AppSnack.info(context, 'Регистрийн дугаар хуулагдлаа.');
                    }
                  },
                  visualDensity: VisualDensity.compact,
                  tooltip: 'Хуулах',
                  icon: const Icon(Icons.copy_rounded, size: 18),
                ),
              ],
            ],
          ),
          const Divider(height: 20),
          InfoRow(label: 'Эцэг/эхийн нэр', value: profile.lastName),
          InfoRow(label: 'Өөрийн нэр', value: profile.firstName),
          InfoRow(
            label: 'Төрсөн огноо',
            value: MnFormat.date(profile.birthday),
          ),
          InfoRow(
            label: 'Нас',
            value: profile.effectiveAge == null
                ? '—'
                : '${profile.effectiveAge}',
          ),
        ],
      ),
    );
  }
}

class _ContactCard extends StatelessWidget {
  const _ContactCard({required this.profile});

  final PatientProfile profile;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Холбоо барих',
      icon: Icons.phone_outlined,
      child: Column(
        children: <Widget>[
          InfoRow(label: 'Утас', value: profile.telephone ?? ''),
          InfoRow(label: 'Нэмэлт утас', value: profile.telephone2 ?? ''),
          InfoRow(label: 'Ажлын газар', value: profile.workplace ?? ''),
        ],
      ),
    );
  }
}

class _AddressCard extends StatelessWidget {
  const _AddressCard({required this.profile});

  final PatientProfile profile;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Хаяг',
      icon: Icons.location_on_outlined,
      child: Column(
        children: <Widget>[
          InfoRow(label: 'Аймаг/Хот', value: profile.provinceCity ?? ''),
          InfoRow(label: 'Сум/Дүүрэг', value: profile.soumDistrict ?? ''),
          InfoRow(label: 'Баг/Хороо', value: profile.bagKhoroo ?? ''),
        ],
      ),
    );
  }
}

class _ReadOnlyNotice extends StatelessWidget {
  const _ReadOnlyNotice();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.infoLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.info.withValues(alpha: 0.25)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Icon(Icons.info_outline_rounded,
              size: 20, color: AppColors.info),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Бүртгэлийн мэдээлэл эмнэлгийн нэгдсэн сангаас татагддаг тул '
              'апп дээрээс засах боломжгүй. Мэдээлэл буруу бол эмнэлгийн '
              'бүртгэлийн хэсэгт хандана уу.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppColors.info,
                height: 1.45,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
