import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'consent.dart';
import 'consents_controller.dart';

/// Техникийн шаардлага §1.2 — "Зөвшөөрөл".
///
/// Эмнэлгийн тусламж үзүүлэхээс бусад зорилгоор (судалгаа, статистик, сургалт)
/// хувийн мэдээллийг ашиглахад хэрэглэгч өөрөө зөвшөөрөл өгнө, хүссэн үедээ
/// цуцална.
class ConsentsScreen extends StatefulWidget {
  const ConsentsScreen({super.key});

  @override
  State<ConsentsScreen> createState() => _ConsentsScreenState();
}

class _ConsentsScreenState extends State<ConsentsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<ConsentsController>();
      if (controller.state.isIdle) controller.load();
    });
  }

  Future<void> _decide(ConsentPurpose purpose, bool grant) async {
    final controller = context.read<ConsentsController>();

    if (grant) {
      // Текстийг уншуулалгүйгээр зөвшөөрөл авахгүй: хүн юунд зөвшөөрснөө
      // мэдэхгүй бол энэ нь зөвшөөрөл биш.
      final document = await controller.document(purpose.purposeCode);
      if (!mounted) return;
      if (document == null) {
        AppSnack.error(context, 'Зөвшөөрлийн текстийг уншиж чадсангүй.');
        return;
      }
      final accepted = await showModalBottomSheet<bool>(
        context: context,
        isScrollControlled: true,
        builder: (_) => _ConsentSheet(document: document),
      );
      if (accepted != true || !mounted) return;
      final error = await controller.setGranted(
        purpose,
        granted: true,
        documentId: document.id,
      );
      if (!mounted) return;
      if (error != null) {
        AppSnack.error(context, error.message);
      } else {
        AppSnack.success(context, 'Зөвшөөрлийг бүртгэлээ.');
      }
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext ctx) => AlertDialog(
        title: const Text('Зөвшөөрөл цуцлах'),
        content: Text(
          '"${purpose.titleMn}" зөвшөөрлийг цуцлах уу? Та хүссэн үедээ '
          'дахин зөвшөөрч болно.',
        ),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Болих'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Цуцлах'),
          ),
        ],
      ),
    );
    if (confirmed != true || !mounted) return;
    final error = await controller.setGranted(purpose, granted: false);
    if (!mounted) return;
    if (error != null) {
      AppSnack.error(context, error.message);
    } else {
      AppSnack.info(context, 'Зөвшөөрлийг цуцаллаа.');
    }
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<ConsentsController>();
    final state = controller.state;

    return Scaffold(
      appBar: AppBar(title: const Text('Зөвшөөрөл')),
      body: Builder(
        builder: (BuildContext context) {
          if (state.isFirstLoad) {
            return const LoadingView(label: 'Уншиж байна…');
          }
          if (controller.isDisabled) {
            return const PendingModuleNotice(
              title: 'Зөвшөөрлийн бүртгэл идэвхгүй байна',
              message: 'Энэ хэсэг серверт хараахан нээгдээгүй байна. '
                  'Нээгдсэн үед та мэдээллээ ямар зорилгоор ашиглахыг '
                  'өөрөө зөвшөөрч, цуцлах боломжтой болно.',
              icon: Icons.verified_user_outlined,
            );
          }
          if (state.hasError && !state.hasData) {
            return ErrorView(
              error: state.error!,
              onRetry: () => controller.load(refresh: true),
            );
          }

          final items = controller.items;
          if (items.isEmpty) {
            return const EmptyView(
              title: 'Зөвшөөрөл шаардсан зүйл алга',
              message: 'Одоогоор танаас зөвшөөрөл хүссэн зорилго байхгүй байна.',
              icon: Icons.verified_user_outlined,
            );
          }

          return RefreshIndicator(
            onRefresh: () => controller.load(refresh: true),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 32),
              children: <Widget>[
                const _Intro(),
                const SizedBox(height: 12),
                for (final purpose in items) ...<Widget>[
                  _PurposeCard(
                    purpose: purpose,
                    busy: controller.busyPurpose == purpose.purposeCode,
                    onChanged: (bool value) => _decide(purpose, value),
                    onRead: () async {
                      final document =
                          await controller.document(purpose.purposeCode);
                      if (!context.mounted) return;
                      if (document == null) {
                        AppSnack.error(
                          context,
                          'Зөвшөөрлийн текстийг уншиж чадсангүй.',
                        );
                        return;
                      }
                      await showModalBottomSheet<bool>(
                        context: context,
                        isScrollControlled: true,
                        builder: (_) =>
                            _ConsentSheet(document: document, readOnly: true),
                      );
                    },
                  ),
                  const SizedBox(height: 12),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _Intro extends StatelessWidget {
  const _Intro();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SectionCard(
      title: 'Таны мэдээлэл, таны шийдвэр',
      icon: Icons.privacy_tip_outlined,
      child: Text(
        'Эмнэлгийн тусламж, үйлчилгээ үзүүлэхэд таны мэдээллийг ашиглахад '
        'зөвшөөрөл шаардлагагүй. Харин судалгаа, сургалт зэрэг бусад '
        'зорилгоор ашиглахад танаас зөвшөөрөл авна. Өгсөн зөвшөөрлөө хүссэн '
        'үедээ цуцалж болно.',
        style: theme.textTheme.bodySmall?.copyWith(height: 1.5),
      ),
    );
  }
}

class _PurposeCard extends StatelessWidget {
  const _PurposeCard({
    required this.purpose,
    required this.busy,
    required this.onChanged,
    required this.onRead,
  });

  final ConsentPurpose purpose;
  final bool busy;
  final ValueChanged<bool> onChanged;
  final VoidCallback onRead;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final (String label, Color color) = switch (purpose) {
      ConsentPurpose(isGranted: true) => ('Зөвшөөрсөн', AppColors.success),
      ConsentPurpose(isWithdrawn: true) => ('Цуцалсан', AppColors.warning),
      _ => ('Хариулаагүй', AppColors.info),
    };

    return SectionCard(
      title: purpose.titleMn.isEmpty ? purpose.purposeCode : purpose.titleMn,
      icon: Icons.assignment_turned_in_outlined,
      trailing: busy
          ? const SizedBox(
              width: 18,
              height: 18,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : Switch(
              value: purpose.isGranted,
              onChanged: onChanged,
            ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  label,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: color,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(width: 8),
              if (purpose.version != null)
                Text(
                  'Хувилбар ${purpose.version}',
                  style: theme.textTheme.bodySmall,
                ),
            ],
          ),
          if (purpose.isGranted && purpose.grantedDate != null) ...<Widget>[
            const SizedBox(height: 8),
            InfoRow(
              label: 'Зөвшөөрсөн',
              value: MnFormat.dateTime(purpose.grantedDate),
            ),
          ],
          if (purpose.isWithdrawn && purpose.withdrawnDate != null) ...<Widget>[
            const SizedBox(height: 8),
            InfoRow(
              label: 'Цуцалсан',
              value: MnFormat.dateTime(purpose.withdrawnDate),
            ),
          ],
          if (purpose.superseded) ...<Widget>[
            const SizedBox(height: 8),
            Text(
              'Зөвшөөрлийн текст шинэчлэгдсэн байна. Уншаад дахин '
              'баталгаажуулна уу.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppColors.warning,
              ),
            ),
          ],
          const SizedBox(height: 4),
          Align(
            alignment: Alignment.centerLeft,
            child: TextButton.icon(
              onPressed: onRead,
              icon: const Icon(Icons.description_outlined, size: 18),
              label: const Text('Текстийг унших'),
            ),
          ),
        ],
      ),
    );
  }
}

class _ConsentSheet extends StatelessWidget {
  const _ConsentSheet({required this.document, this.readOnly = false});

  final ConsentDocument document;
  final bool readOnly;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.75,
      maxChildSize: 0.95,
      builder: (BuildContext context, ScrollController scroll) => Padding(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Text(document.titleMn, style: theme.textTheme.titleMedium),
            if (document.version != null)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Text(
                  'Хувилбар ${document.version}',
                  style: theme.textTheme.bodySmall,
                ),
              ),
            const SizedBox(height: 12),
            Expanded(
              child: SingleChildScrollView(
                controller: scroll,
                child: Text(
                  document.bodyMn,
                  style: theme.textTheme.bodyMedium?.copyWith(height: 1.55),
                ),
              ),
            ),
            const SizedBox(height: 12),
            if (readOnly)
              OutlinedButton(
                onPressed: () => Navigator.of(context).pop(),
                child: const Text('Хаах'),
              )
            else
              Row(
                children: <Widget>[
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(false),
                      child: const Text('Болих'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton(
                      onPressed: () => Navigator.of(context).pop(true),
                      child: const Text('Зөвшөөрөх'),
                    ),
                  ),
                ],
              ),
          ],
        ),
      ),
    );
  }
}
