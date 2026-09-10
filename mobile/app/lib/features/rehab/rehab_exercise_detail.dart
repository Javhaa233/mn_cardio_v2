import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'rehab_controller.dart';
import 'rehab_models.dart';

/// Дасгалын дэлгэрэнгүй, гүйцэтгэлээ тэмдэглэх хуудас.
Future<void> showRehabExerciseDetail(
  BuildContext context,
  RehabExercise exercise,
) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    builder: (_) => _ExerciseDetailSheet(exercise: exercise),
  );
}

class _ExerciseDetailSheet extends StatefulWidget {
  const _ExerciseDetailSheet({required this.exercise});

  final RehabExercise exercise;

  @override
  State<_ExerciseDetailSheet> createState() => _ExerciseDetailSheetState();
}

class _ExerciseDetailSheetState extends State<_ExerciseDetailSheet> {
  final TextEditingController _notes = TextEditingController();
  bool _saving = false;

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final exercise = widget.exercise;
    final description = (exercise.description ?? '').trim();
    final lastAt = context.watch<RehabController>().lastCompletedAt(exercise.id);

    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (BuildContext context, ScrollController scroll) {
        return ListView(
          controller: scroll,
          padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
          children: <Widget>[
            Text(exercise.name, style: theme.textTheme.titleLarge),
            const SizedBox(height: 6),
            Wrap(
              spacing: 14,
              runSpacing: 6,
              children: <Widget>[
                if (exercise.durationSec != null)
                  Text(
                    'Үргэлжлэх хугацаа: ${MnFormat.duration(exercise.durationSec)}',
                    style: theme.textTheme.bodySmall,
                  ),
                if (lastAt != null)
                  Text(
                    'Сүүлд хийсэн: ${MnFormat.friendlyDate(lastAt)}',
                    style: theme.textTheme.bodySmall,
                  ),
              ],
            ),
            const SizedBox(height: 18),
            _VideoPlaceholder(exercise: exercise),
            if (description.isNotEmpty) ...<Widget>[
              const SizedBox(height: 14),
              SectionCard(
                title: 'Гүйцэтгэх заавар',
                icon: Icons.menu_book_outlined,
                child: Text(
                  description,
                  style: theme.textTheme.bodyMedium?.copyWith(height: 1.55),
                ),
              ),
            ],
            const SizedBox(height: 14),
            SectionCard(
              title: 'Гүйцэтгэлээ тэмдэглэх',
              icon: Icons.check_circle_outline_rounded,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  TextField(
                    controller: _notes,
                    minLines: 2,
                    maxLines: 4,
                    maxLength: 500,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: const InputDecoration(
                      hintText: 'Биеийн байдал, тэмдэглэл (заавал биш)',
                      counterText: '',
                    ),
                  ),
                  const SizedBox(height: 12),
                  FilledButton.icon(
                    onPressed: _saving ? null : _markCompleted,
                    icon: _saving
                        ? const SizedBox(
                            width: 18,
                            height: 18,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.2,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.check_rounded),
                    label: Text(_saving ? 'Хадгалж байна…' : 'Хийж дуусгасан'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            const RehabSafetyNoticeCompact(),
          ],
        );
      },
    );
  }

  Future<void> _markCompleted() async {
    setState(() => _saving = true);
    final controller = context.read<RehabController>();
    final error = await controller.markCompleted(
      exerciseId: widget.exercise.id,
      durationSec: widget.exercise.durationSec,
      notes: _notes.text,
    );
    if (!mounted) return;
    setState(() => _saving = false);

    final messenger = ScaffoldMessenger.of(context);
    if (error != null) {
      AppSnack.error(context, error.message);
      return;
    }
    Navigator.of(context).pop();
    AppSnack.successOn(messenger, 'Гүйцэтгэл тэмдэглэгдлээ.');
  }
}

/// Дасгалын видеоны байрлал.
///
/// 39 дасгалын видео **хараахан байхгүй**: бичлэг эхлээгүй (BLOCKERS.md, ЗСҮТ
/// захидлын 9-р зүйл), байршуулах газар шийдэгдээгүй (10-р зүйл), мөн backend
/// талд видео урсгалаар дамжуулах зам байхгүй (READINESS.md §2.4). Тиймээс
/// энд байхгүй тоглуулагчийг байгаа мэт харагдуулахгүй.
class _VideoPlaceholder extends StatelessWidget {
  const _VideoPlaceholder({required this.exercise});

  final RehabExercise exercise;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      height: 168,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: theme.dividerColor),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(
            Icons.movie_creation_outlined,
            size: 34,
            color: theme.colorScheme.onSurfaceVariant,
          ),
          const SizedBox(height: 10),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Text(
              'Дасгалын заавар видео бэлтгэгдэж байна.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall,
            ),
          ),
        ],
      ),
    );
  }
}

/// Дэлгэрэнгүй хуудсан дээрх богино анхааруулга.
class RehabSafetyNoticeCompact extends StatelessWidget {
  const RehabSafetyNoticeCompact({super.key});

  @override
  Widget build(BuildContext context) {
    return const PendingModuleNotice(
      title: 'Анхааруулга',
      message: 'Дасгал хийх үед цээж өвдөх, амьсгаадах, толгой эргэх шинж '
          'илэрвэл даруй зогсоож эмчдээ хандана уу.',
      icon: Icons.warning_amber_rounded,
    );
  }
}
