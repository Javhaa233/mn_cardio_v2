import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/media_views.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'rehab_controller.dart';
import 'rehab_player_models.dart';
import 'rehab_screen.dart';
import 'rehab_session_setup.dart';

/// "Өнөөдрийн дасгал" (сонголт §8): долоо хоногийн тууз, өнөөдрийн хэсгүүд
/// зурагтайгаар, дараалсан өдрийн тоо (§11).
class RehabTodayTab extends StatelessWidget {
  const RehabTodayTab({super.key});

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<RehabController>();
    final state = controller.today;

    if (state.isFirstLoad) {
      return const LoadingView(label: 'Өнөөдрийн дасгал уншиж байна…');
    }
    if (state.hasError && !state.hasData) {
      if (controller.moduleDisabled) return const RehabDisabledView();
      return ErrorView(
          error: state.error!,
          onRetry: () => controller.loadToday(refresh: true));
    }

    final today = state.data ?? RehabToday.empty;
    return RefreshIndicator(
      onRefresh: () => controller.loadToday(refresh: true),
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: <Widget>[
          if (!today.hasPlan)
            const Padding(
              padding: EdgeInsets.only(top: 40),
              child: EmptyView(
                title: 'Эмч тань хөтөлбөр оноогоогүй байна',
                message: 'Сэргээн засах эмч хөтөлбөр оноосны дараа өдөр бүрийн '
                    'дасгал тань энд гарч ирнэ. Энэ хооронд "Бүх дасгал" хэсгээс '
                    'дасгалуудтай танилцаж болно.',
                icon: Icons.event_note_outlined,
              ),
            )
          else ...<Widget>[
            _StreakBanner(today: today),
            const SizedBox(height: 14),
            _PlanCard(today: today),
            const SizedBox(height: 14),
            for (final block in today.blocks)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _BlockTile(block: block),
              ),
          ],
        ],
      ),
    );
  }
}

/// Цуваа: "5 өдөр дараалан хийлээ".
///
/// Долоо хоногийн тууз энд байсныг 2026-09-18-нд хэрэглэгч хассан: энэ хэсэгт
/// зөвхөн цуваа харагдана. Доор нь ХООСОН ЗАЙ үлдээв — Duolingo маягийн жижиг
/// анимацийг дараа тусад нь зохиож тавина (хэрэглэгчийн шийдвэр), тиймээс энд
/// түр орлуулагч зураг ч тавиагүй.
class _StreakBanner extends StatelessWidget {
  const _StreakBanner({required this.today});

  final RehabToday today;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final days = today.streak;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        Row(
          children: <Widget>[
            const Icon(
              Icons.local_fire_department_rounded,
              color: AppColors.warning,
              size: 30,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                days > 0
                    ? '$days өдөр дараалан хийлээ'
                    : 'Өнөөдрөөс цувааг эхлүүлье',
                style: theme.textTheme.titleLarge
                    ?.copyWith(fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        // Анимацийн зай. Дараа дүүргэнэ.
        const SizedBox(height: 8),
      ],
    );
  }
}

class _PlanCard extends StatelessWidget {
  const _PlanCard({required this.today});

  final RehabToday today;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final plan = today.plan!;
    return SectionCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            '${plan.programName.toUpperCase()} · ${plan.dayNo ?? '—'} ДАХЬ ӨДӨР',
            style: theme.textTheme.labelMedium
                ?.copyWith(color: AppColors.cyanInk, letterSpacing: 0.6),
          ),
          const SizedBox(height: 6),
          Text(
            today.doneToday
                ? 'Өнөөдрийн дасгал хийгдсэн'
                : 'Өнөөдөр ${today.totalMinutes} минут',
            style: theme.textTheme.headlineSmall
                ?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          Wrap(
            spacing: 14,
            runSpacing: 4,
            children: <Widget>[
              if (today.streak > 0)
                _Chip(
                    icon: Icons.local_fire_department_rounded,
                    label: '${today.streak} өдөр дараалан'),
              if (plan.hasHrTarget && today.maxHr != null)
                _Chip(
                    icon: Icons.favorite_border_rounded,
                    label: 'Дээд пульс ${today.maxHr}'),
              if (plan.intensityPct != null)
                _Chip(
                    icon: Icons.speed_rounded,
                    label:
                        'Эрчим ${MnFormat.number(plan.intensityPct, decimals: 0)}%'),
            ],
          ),
          if ((plan.notes ?? '').trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 8),
            Text('Эмчийн тэмдэглэл: ${plan.notes!.trim()}',
                style: theme.textTheme.bodyMedium),
          ],
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: FilledButton.icon(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.cyanInk,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: today.notStarted || today.openBlocks.isEmpty
                  ? null
                  : () => startRehabToday(context, today),
              icon: const Icon(Icons.play_arrow_rounded),
              label: Text(
                today.notStarted
                    ? 'Хөтөлбөр ${MnFormat.date(plan.startDate)}-нд эхэлнэ'
                    : today.doneToday
                        ? 'Дахин хийх'
                        : 'Дасгал эхлэх',
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _Chip extends StatelessWidget {
  const _Chip({required this.icon, required this.label});

  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: <Widget>[
        Icon(icon, size: 16, color: AppColors.inkMuted),
        const SizedBox(width: 4),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}

/// Нэг хэсэг — гарчиг, минут, хөдөлгөөнүүдийн зураг (хэрэглэгчийн тэмдэглэл §8).
class _BlockTile extends StatelessWidget {
  const _BlockTile({required this.block});

  final RehabBlock block;

  IconData get _icon {
    if (block.isTimed) {
      if (block.title.contains('Дугуй')) return Icons.pedal_bike_rounded;
      if (block.title.contains('Шат')) return Icons.stairs_rounded;
      return Icons.directions_walk_rounded;
    }
    if (block.isVitals) return Icons.monitor_heart_outlined;
    if (block.isImage) return Icons.image_outlined;
    return Icons.self_improvement_rounded;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final api = context.read<RehabController>().repository.api;
    final thumbs = <String>[
      for (final m in block.movements)
        if (m.thumb.isAvailable) m.thumb.url!,
    ];
    if (thumbs.isEmpty && block.thumb.isAvailable) thumbs.add(block.thumb.url!);

    return Opacity(
      opacity: block.locked ? 0.55 : 1,
      child: SectionCard(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Row(
              children: <Widget>[
                Container(
                  width: 44,
                  height: 44,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: AppColors.infoLight,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(block.locked ? Icons.lock_outline_rounded : _icon,
                      color: AppColors.cyanInk),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(block.title, style: theme.textTheme.titleSmall),
                      const SizedBox(height: 2),
                      Text(
                        block.locked
                            ? '${block.unlocksOnDay ?? ''} дахь өдрөөс нээгдэнэ'
                            : <String>[
                                if (block.durationSec != null)
                                  MnFormat.duration(block.durationSec),
                                if (block.movements.isNotEmpty)
                                  '${block.movements.length} хөдөлгөөн',
                                if (block.isTimed) '2 мин тутам пульс',
                              ].join(' · '),
                        style: theme.textTheme.bodySmall,
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (!block.locked &&
                (thumbs.isNotEmpty || block.movements.isNotEmpty)) ...<Widget>[
              const SizedBox(height: 10),
              SizedBox(
                height: 96,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: thumbs.isNotEmpty
                      ? thumbs.length
                      : block.movements.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 8),
                  itemBuilder: (BuildContext context, int i) {
                    if (thumbs.isNotEmpty) {
                      return AuthedImage(
                        api: api,
                        url: thumbs[i],
                        width: 54,
                        height: 96,
                        borderRadius: BorderRadius.circular(10),
                      );
                    }
                    // Зураг хараахан байхгүй — нэрээр нь.
                    return Container(
                      width: 96,
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.canvas,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const Icon(Icons.accessibility_new_rounded,
                              size: 22, color: AppColors.cyanDeep),
                          const Spacer(),
                          Text(
                            block.movements[i].name,
                            maxLines: 3,
                            overflow: TextOverflow.ellipsis,
                            style: theme.textTheme.labelSmall,
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
