import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'risk_assessment.dart';
import 'risk_controller.dart';

/// 2.5 Эрсдэл үнэлгээ (ЗСӨ).
///
/// Энэ дэлгэц **оноо тооцохгүй**. Аргачлал батлагдаагүй байхад эрсдэлийн
/// хувь харуулах нь эмнэлзүйн хувьд аюултай тул зөвхөн эмнэлэгт бүртгэгдсэн
/// үзүүлэлтүүдийг харуулж, дүгнэлтийг эмч гаргана гэдгийг тодорхой хэлнэ.
class RiskScreen extends StatefulWidget {
  const RiskScreen({super.key});

  @override
  State<RiskScreen> createState() => _RiskScreenState();
}

class _RiskScreenState extends State<RiskScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<RiskController>();
      if (controller.state.isIdle) controller.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<RiskController>();
    final state = controller.state;

    return Scaffold(
      appBar: AppBar(title: const Text('Эрсдэл үнэлгээ')),
      body: Builder(
        builder: (BuildContext context) {
          if (state.isFirstLoad) {
            return const LoadingView(label: 'Үзүүлэлт уншиж байна…');
          }
          if (state.hasError && !state.hasData) {
            return ErrorView(
              error: state.error!,
              onRetry: () => controller.load(refresh: true),
            );
          }

          final risk = state.data ?? RiskAssessment.empty;

          return RefreshIndicator(
            onRefresh: () => controller.load(refresh: true),
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
              children: <Widget>[
                const _MethodologyNotice(),
                const SizedBox(height: 14),
                if (risk.isEmpty)
                  const Padding(
                    padding: EdgeInsets.only(top: 40),
                    child: EmptyView(
                      title: 'Үзүүлэлт бүртгэгдээгүй байна',
                      message: 'Эмнэлэгт үзүүлж, хэмжилт хийлгэсний дараа '
                          'таны үзүүлэлтүүд энд харагдана.',
                      icon: Icons.assignment_outlined,
                    ),
                  )
                else ...<Widget>[
                  if (risk.bodySizeFields.isNotEmpty)
                    SectionCard(
                      title: 'Амин үзүүлэлт, хэмжилт',
                      subtitle: risk.measuredAt == null
                          ? null
                          : 'Сүүлд бүртгэсэн: '
                              '${MnFormat.date(risk.measuredAt)}',
                      icon: Icons.monitor_heart_outlined,
                      child: Column(
                        children: <Widget>[
                          for (final field in risk.bodySizeFields)
                            InfoRow(
                              label: field.label,
                              value: field.displayValue,
                            ),
                        ],
                      ),
                    ),
                  if (risk.historyFields.isNotEmpty) ...<Widget>[
                    const SizedBox(height: 12),
                    SectionCard(
                      title: 'Өвчний түүх, эрсдэлт хүчин зүйл',
                      icon: Icons.history_edu_outlined,
                      child: Column(
                        children: <Widget>[
                          for (final field in risk.historyFields)
                            _YesNoRow(field: field),
                        ],
                      ),
                    ),
                  ],
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}

class _YesNoRow extends StatelessWidget {
  const _YesNoRow({required this.field});

  final RiskField field;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isYes = field.value == 'Тийм';

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
            child: Text(field.label, style: theme.textTheme.bodyMedium),
          ),
          const SizedBox(width: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
            decoration: BoxDecoration(
              color: theme.colorScheme.surfaceContainerHighest
                  .withValues(alpha: 0.7),
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              field.value,
              style: theme.textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.w600,
                // Тийм/Үгүй нь эмнэлзүйн дүгнэлт биш тул өнгөөр эрсдэл
                // илэрхийлэхгүй — зөвхөн онцлон харуулна.
                color: isYes
                    ? theme.colorScheme.onSurface
                    : theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MethodologyNotice extends StatelessWidget {
  const _MethodologyNotice();

  @override
  Widget build(BuildContext context) {
    return const PendingModuleNotice(
      title: 'Эрсдэлийн оноо хараахан тооцогдохгүй байна',
      message: 'Зүрх судасны өвчний эрсдэл тооцох аргачлал, эрсдэлийн ангиллыг '
          'Зүрх судасны үндэсний төв батлах шатандаа байна. Тиймээс энэ хэсэгт '
          'таны эмнэлэгт бүртгэгдсэн үзүүлэлтүүдийг эх хэвээр нь харуулж байна. '
          'Эрсдэлийн дүгнэлтийг эмч тань гаргана.',
      icon: Icons.pending_actions_outlined,
    );
  }
}
