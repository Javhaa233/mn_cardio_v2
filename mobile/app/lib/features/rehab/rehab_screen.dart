import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'rehab_assessment_tab.dart';
import 'rehab_controller.dart';
import 'rehab_exercise_detail.dart';
import 'rehab_models.dart';
import 'rehab_today_tab.dart';
import 'rehab_vitals_tab.dart';

/// 2.7 Сэргээн засах, дасгал хөдөлгөөн.
class RehabScreen extends StatefulWidget {
  const RehabScreen({super.key});

  @override
  State<RehabScreen> createState() => _RehabScreenState();
}

class _RehabScreenState extends State<RehabScreen>
    with SingleTickerProviderStateMixin {
  late final TabController _tabs = TabController(length: 4, vsync: this);

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<RehabController>();
      if (controller.exercises.isIdle) controller.loadAll();
    });
  }

  @override
  void dispose() {
    _tabs.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Сэргээн засах'),
        bottom: TabBar(
          controller: _tabs,
          isScrollable: true,
          tabAlignment: TabAlignment.start,
          tabs: const <Widget>[
            Tab(text: 'Өнөөдрийн дасгал'),
            Tab(text: 'Бүх дасгал'),
            Tab(text: 'Амин үзүүлэлт'),
            Tab(text: 'Үнэлгээ, зөвлөгөө'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabs,
        children: const <Widget>[
          RehabTodayTab(),
          _ExercisesTab(),
          RehabVitalsTab(),
          RehabAssessmentTab(),
        ],
      ),
    );
  }
}

/// Модуль эмнэлгийн систем дээр идэвхжээгүй үеийн дэлгэц.
///
/// Энэ бол хэрэглэгчийн буруу биш, дахин оролдоод шийдэгдэхгүй нөхцөл тул
/// "Алдаа гарлаа. Дахин оролдоно уу." гэж хэлэхгүй.
class RehabDisabledView extends StatelessWidget {
  const RehabDisabledView({super.key});

  @override
  Widget build(BuildContext context) {
    return const Padding(
      padding: EdgeInsets.fromLTRB(24, 40, 24, 24),
      child: EmptyView(
        title: 'Сэргээн засах хэсэг хараахан нээгдээгүй байна',
        message: 'Энэ модулийг эмнэлгийн систем дээр идэвхжүүлэх ажил '
            'хийгдэж байна. Нээгдмэгц дасгалын заавар, амин үзүүлэлтийн '
            'бүртгэл, эмчийн үнэлгээ энд харагдана.',
        icon: Icons.construction_outlined,
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Дасгалын каталог
// ---------------------------------------------------------------------------

class _ExercisesTab extends StatelessWidget {
  const _ExercisesTab();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<RehabController>();
    final state = controller.exercises;

    if (state.isFirstLoad) {
      return const LoadingView(label: 'Дасгалууд уншиж байна…');
    }

    if (state.hasError && !state.hasData) {
      if (controller.moduleDisabled) return const RehabDisabledView();
      return ErrorView(
        error: state.error!,
        onRetry: () => controller.loadExercises(refresh: true),
      );
    }

    final exercises = state.data ?? const <RehabExercise>[];

    return RefreshIndicator(
      onRefresh: () => controller.loadExercises(refresh: true),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: <Widget>[
          const RehabSafetyNotice(),
          const SizedBox(height: 14),
          if (exercises.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 30),
              child: EmptyView(
                title: 'Дасгал бүртгэгдээгүй байна',
                message: 'Эмнэлгээс дасгалын хөтөлбөр оруулсны дараа энд '
                    'харагдана.',
                icon: Icons.self_improvement_outlined,
              ),
            )
          else ...<Widget>[
            _ProgressSummary(controller: controller, total: exercises.length),
            const SizedBox(height: 14),
            for (final exercise in exercises)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _ExerciseTile(
                  exercise: exercise,
                  lastCompletedAt: controller.lastCompletedAt(exercise.id),
                ),
              ),
          ],
        ],
      ),
    );
  }
}

class _ProgressSummary extends StatelessWidget {
  const _ProgressSummary({required this.controller, required this.total});

  final RehabController controller;
  final int total;

  @override
  Widget build(BuildContext context) {
    return SectionCard(
      title: 'Миний гүйцэтгэл',
      icon: Icons.trending_up_rounded,
      child: Row(
        children: <Widget>[
          Expanded(
            child: StatTile(
              label: 'Өнөөдөр хийсэн',
              value: '${controller.completedToday}',
              unit: 'дасгал',
              icon: Icons.today_outlined,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: StatTile(
              label: 'Нийт бүртгэсэн',
              value: '${controller.progress.length}',
              unit: 'удаа',
              icon: Icons.checklist_rounded,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: StatTile(
              label: 'Хөтөлбөрт',
              value: '$total',
              unit: 'дасгал',
              icon: Icons.list_alt_rounded,
            ),
          ),
        ],
      ),
    );
  }
}

class _ExerciseTile extends StatelessWidget {
  const _ExerciseTile({
    required this.exercise,
    required this.lastCompletedAt,
  });

  final RehabExercise exercise;
  final DateTime? lastCompletedAt;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final description = (exercise.description ?? '').trim();

    return SectionCard(
      padding: const EdgeInsets.fromLTRB(14, 14, 14, 14),
      onTap: () => showRehabExerciseDetail(context, exercise),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: 46,
            height: 46,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              exercise.hasMedia
                  ? Icons.play_circle_outline_rounded
                  : Icons.self_improvement_outlined,
              color: theme.colorScheme.primary,
              size: 24,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(exercise.name, style: theme.textTheme.titleSmall),
                if (description.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 4),
                  Text(
                    description,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall,
                  ),
                ],
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: <Widget>[
                    if (exercise.durationSec != null)
                      _MiniChip(
                        icon: Icons.schedule_outlined,
                        label: MnFormat.duration(exercise.durationSec),
                      ),
                    if (lastCompletedAt != null)
                      _MiniChip(
                        icon: Icons.check_circle_outline_rounded,
                        label: MnFormat.friendlyDate(lastCompletedAt),
                        highlight: true,
                      ),
                  ],
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, size: 20),
        ],
      ),
    );
  }
}

class _MiniChip extends StatelessWidget {
  const _MiniChip({
    required this.icon,
    required this.label,
    this.highlight = false,
  });

  final IconData icon;
  final String label;
  final bool highlight;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = highlight
        ? theme.colorScheme.primary
        : theme.colorScheme.onSurfaceVariant;
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Icon(icon, size: 14, color: color),
        const SizedBox(width: 4),
        Text(
          label,
          style: theme.textTheme.bodySmall?.copyWith(
            fontSize: 12,
            color: color,
            fontWeight: highlight ? FontWeight.w600 : null,
          ),
        ),
      ],
    );
  }
}

/// Шаардлага §46 "Анхааруулга".
///
/// Эмнэлзүйн заавар, дасгалын анхааруулгын **эцсийн үг хэллэгийг** тус
/// эмнэлгийн сэргээн засах эмч нар батлах ёстой (BLOCKERS.md, ЗСҮТ-д
/// илгээсэн захидлын 9-р зүйл). Энд байгаа нь ерөнхий аюулгүй байдлын
/// сануулга бөгөөд батлагдсан эх бэлэн болмогц солигдоно.
class RehabSafetyNotice extends StatelessWidget {
  const RehabSafetyNotice({super.key});

  @override
  Widget build(BuildContext context) {
    return const PendingModuleNotice(
      title: 'Анхааруулга',
      message: 'Дасгал хийх үед цээж өвдөх, амьсгаадах, толгой эргэх, '
          'дотор муухайрах шинж илэрвэл дасгалаа даруй зогсоож, эмчдээ '
          'хандана уу. Дасгалын ачааллыг эмчийнхээ зөвлөсний дагуу '
          'нэмэгдүүлнэ.',
      icon: Icons.warning_amber_rounded,
    );
  }
}
