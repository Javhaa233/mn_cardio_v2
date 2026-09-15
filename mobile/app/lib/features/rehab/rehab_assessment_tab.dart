import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'rehab_controller.dart';
import 'rehab_screen.dart';

/// Шаардлага §43 (эрсдэлийн болон ачаалал даах чадварын үнэлгээ) ба
/// §45 (зөвлөгөө).
///
/// Үнэлгээг эмч бүртгэдэг, үйлчлүүлэгч зөвхөн уншина. **Оноог энд
/// тооцохгүй** — аргачлал ЗСҮТ-ийн батламж хүлээж байна.
class RehabAssessmentTab extends StatelessWidget {
  const RehabAssessmentTab({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<RehabController>();
    final state = controller.assessment;
    final theme = Theme.of(context);

    if (state.isFirstLoad) {
      return const LoadingView(label: 'Үнэлгээ уншиж байна…');
    }

    if (state.hasError && !state.hasData) {
      if (controller.moduleDisabled) return const RehabDisabledView();
      return ErrorView(
        error: state.error!,
        onRetry: () => controller.loadAssessment(refresh: true),
      );
    }

    final assessment = state.data;

    return RefreshIndicator(
      onRefresh: () => controller.loadAssessment(refresh: true),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: <Widget>[
          if (assessment == null)
            const Padding(
              padding: EdgeInsets.only(top: 30, bottom: 20),
              child: EmptyView(
                title: 'Үнэлгээ хийгдээгүй байна',
                message: 'Сэргээн засах эмч тань эрсдэлийн болон ачаалал '
                    'даах чадварын үнэлгээ хийсний дараа энд харагдана.',
                icon: Icons.assignment_turned_in_outlined,
              ),
            )
          else ...<Widget>[
            SectionCard(
              title: 'Эмчийн үнэлгээ',
              subtitle: assessment.assessmentDate == null
                  ? null
                  : 'Огноо: ${MnFormat.date(assessment.assessmentDate)}',
              icon: Icons.assignment_turned_in_outlined,
              child: Column(
                children: <Widget>[
                  InfoRow(
                    label: 'Эрсдэлийн түвшин',
                    value: assessment.riskLevel ?? '',
                  ),
                  InfoRow(
                    label: 'Ачаалал даах чадвар',
                    value: assessment.toleranceLabel,
                  ),
                ],
              ),
            ),
            if ((assessment.notes ?? '').trim().isNotEmpty) ...<Widget>[
              const SizedBox(height: 12),
              SectionCard(
                title: 'Эмчийн зөвлөгөө',
                icon: Icons.tips_and_updates_outlined,
                child: Text(
                  assessment.notes!.trim(),
                  style: theme.textTheme.bodyMedium?.copyWith(height: 1.55),
                ),
              ),
            ],
          ],
          if (controller.assessmentHistory.length > 1) ...<Widget>[
            const SizedBox(height: 12),
            SectionCard(
              title: 'Үнэлгээний түүх',
              subtitle: 'Өмнөх үнэлгээтэй харьцуулах',
              icon: Icons.history_outlined,
              child: Column(
                children: <Widget>[
                  for (final row in controller.assessmentHistory.skip(1))
                    InfoRow(
                      label: MnFormat.date(row.assessmentDate),
                      value: <String>[
                        if ((row.riskLevel ?? '').trim().isNotEmpty)
                          row.riskLevel!.trim(),
                        row.toleranceLabel,
                      ].where((String v) => v.trim().isNotEmpty).join(' · '),
                    ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 14),
          const RehabSafetyNotice(),
          const SizedBox(height: 12),
          const PendingModuleNotice(
            title: 'Эрсдэлийн оноо',
            message: 'Ачааллын эрсдэлийг тоогоор илэрхийлэх аргачлалыг Зүрх '
                'судасны үндэсний төв батлах шатандаа байгаа тул апп өөрөө '
                'оноо тооцохгүй. Үнэлгээг зөвхөн эмч гаргана.',
            icon: Icons.pending_actions_outlined,
          ),
        ],
      ),
    );
  }
}
