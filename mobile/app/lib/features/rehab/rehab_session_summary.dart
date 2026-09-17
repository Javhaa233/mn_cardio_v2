import 'package:flutter/material.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/measurement_chart.dart';
import '../../shared/widgets/section_card.dart';
import '../chat/chat_rooms_screen.dart';
import 'rehab_player_models.dart';
import 'rehab_player_widgets.dart';

/// Дасгал дууссаны дараах дүн: үзүүлэлт + пульс, CR10 график (сонголт §10).
///
/// Серверийн хариу ирээгүй (сүлжээгүй) бол [fallback]-аас харуулна — дүн
/// утсан дээр хадгалагдсан бөгөөд дараа нь автоматаар илгээгдэнэ.
class RehabSessionSummaryScreen extends StatelessWidget {
  const RehabSessionSummaryScreen({
    super.key,
    required this.detail,
    required this.fallback,
    this.targetHr,
  });

  final RehabSessionDetail? detail;
  final RehabFinishDraft fallback;
  final int? targetHr;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final d = detail;
    final status = d?.status ?? fallback.status;
    final stopped = status == 'stopped';
    final checkins = d?.checkins ?? fallback.checkins;
    final duration = d?.durationSec ?? fallback.durationSec;
    final completed = d?.completedBlocks ?? fallback.completedBlocks;
    final skipped = d?.skippedMovements ?? fallback.skippedMovements;
    final pulses =
        checkins.map((RehabCheckin c) => c.pulse).whereType<int>().toList();
    final avgPulse = pulses.isEmpty
        ? null
        : (pulses.reduce((int a, int b) => a + b) / pulses.length).round();
    final borgs =
        checkins.map((RehabCheckin c) => c.borg).whereType<int>().toList();
    final maxBorg =
        borgs.isEmpty ? null : borgs.reduce((int a, int b) => a > b ? a : b);

    return Scaffold(
      appBar: AppBar(
        automaticallyImplyLeading: false,
        title: const Text('Дасгалын дүн'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: <Widget>[
          Row(
            children: <Widget>[
              Icon(
                stopped
                    ? Icons.health_and_safety_rounded
                    : Icons.emoji_events_rounded,
                size: 40,
                color: stopped ? AppColors.danger : AppColors.success,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  stopped
                      ? 'Дасгалаа зогсоолоо. Сайн амраарай.'
                      : 'Сайн байна! Өнөөдрийн дасгал дууслаа.',
                  style: theme.textTheme.titleLarge,
                ),
              ),
            ],
          ),
          if (detail == null) ...<Widget>[
            const SizedBox(height: 10),
            Text(
              'Сүлжээ байхгүй тул дүнг утсан дээрээ хадгаллаа. Холбогдмогц автоматаар илгээнэ.',
              style: theme.textTheme.bodySmall,
            ),
          ],
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.7,
            children: <Widget>[
              StatTile(
                  label: 'Хугацаа',
                  value: rehabClock(duration),
                  icon: Icons.timer_outlined),
              StatTile(
                  label: 'Хийсэн хэсэг',
                  value: '$completed',
                  unit: skipped > 0 ? '· $skipped алгассан' : null,
                  icon: Icons.checklist_rounded),
              StatTile(
                  label: 'Дундаж пульс',
                  value: avgPulse?.toString() ?? '—',
                  unit: 'цох/мин',
                  icon: Icons.favorite_border_rounded),
              StatTile(
                  label: 'Хамгийн их ачаалал',
                  value: maxBorg?.toString() ?? '—',
                  unit: '/ 10',
                  icon: Icons.speed_rounded),
            ],
          ),
          const SizedBox(height: 14),
          SectionCard(
            title: 'Пульс ба ачаалал',
            icon: Icons.show_chart_rounded,
            child: MeasurementChart(
              labels: checkins
                  .map((RehabCheckin c) => rehabClock(c.atSec))
                  .toList(),
              series: <ChartSeries>[
                ChartSeries(
                  name: 'Пульс',
                  color: AppColors.chartPulse,
                  values: checkins
                      .map((RehabCheckin c) => c.pulse?.toDouble())
                      .toList(),
                ),
                if (targetHr != null)
                  ChartSeries(
                    name: 'Зорилт',
                    color: AppColors.cyanInk,
                    values: checkins.map((_) => targetHr!.toDouble()).toList(),
                  ),
                ChartSeries(
                  name: 'Ачаалал ×10',
                  color: AppColors.chartWeight,
                  // CR10-ийг пульстай нэг тэнхлэгт харагдуулахын тулд ×10.
                  values: checkins
                      .map((RehabCheckin c) =>
                          c.borg == null ? null : c.borg! * 10.0)
                      .toList(),
                ),
              ],
              unit: '',
            ),
          ),
          if (stopped) ...<Widget>[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                  color: AppColors.dangerLight,
                  borderRadius: BorderRadius.circular(12)),
              child: Text(
                'Цээж өвдөх, шахах мэдрэмж 5 минутаас удаан үргэлжилбэл даруй 103 руу залгана уу.',
                style: theme.textTheme.bodyMedium
                    ?.copyWith(color: const Color(0xFF8E1F2A)),
              ),
            ),
            const SizedBox(height: 10),
            OutlinedButton.icon(
              onPressed: () => Navigator.of(context).push(
                MaterialPageRoute<void>(
                    builder: (_) => const ChatRoomsScreen()),
              ),
              icon: const Icon(Icons.chat_bubble_outline_rounded),
              label: const Text('Эмчтэйгээ холбогдох'),
            ),
          ],
          if (d?.startedAt != null) ...<Widget>[
            const SizedBox(height: 10),
            Text('Эхэлсэн: ${MnFormat.friendlyDateTime(d!.startedAt)}',
                style: theme.textTheme.bodySmall),
          ],
          const SizedBox(height: 18),
          FilledButton(
            style: FilledButton.styleFrom(
              backgroundColor: AppColors.cyanInk,
              padding: const EdgeInsets.symmetric(vertical: 14),
            ),
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Болсон'),
          ),
        ],
      ),
    );
  }
}
