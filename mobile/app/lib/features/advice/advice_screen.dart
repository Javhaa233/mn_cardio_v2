import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/paged_list_view.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'advice.dart';
import 'advice_controller.dart';

/// 2.4 Эмчийн зөвлөгөө.
class AdviceScreen extends StatefulWidget {
  const AdviceScreen({super.key});

  @override
  State<AdviceScreen> createState() => _AdviceScreenState();
}

class _AdviceScreenState extends State<AdviceScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<AdviceController>();
      if (controller.state.isIdle) controller.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<AdviceController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Эмчийн зөвлөгөө')),
      body: PagedListView<Advice>(
        controller: controller,
        loadingLabel: 'Зөвлөгөө уншиж байна…',
        itemBuilder: (BuildContext context, Advice item, _) => _AdviceTile(
          advice: item,
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => AdviceDetailScreen(advice: item),
            ),
          ),
        ),
        empty: const EmptyView(
          title: 'Зөвлөгөө байхгүй байна',
          message: 'Эмч тань зөвлөгөө бичсэн үед энд харагдана.',
          icon: Icons.tips_and_updates_outlined,
        ),
      ),
    );
  }
}

class _AdviceTile extends StatelessWidget {
  const _AdviceTile({required this.advice, required this.onTap});

  final Advice advice;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final body = advice.displayBody;

    return SectionCard(
      onTap: onTap,
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              _StatusChip(closed: advice.closed),
              if ((advice.ticketType ?? '').trim().isNotEmpty) ...<Widget>[
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    advice.ticketType!.trim(),
                    style: theme.textTheme.bodySmall,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
              const Spacer(),
              Text(
                MnFormat.friendlyDate(advice.date),
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            body.isEmpty ? 'Агуулга оруулаагүй байна.' : body,
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: body.isEmpty ? theme.hintColor : null,
              fontStyle: body.isEmpty ? FontStyle.italic : null,
            ),
          ),
          if (advice.thread.isNotEmpty) ...<Widget>[
            const SizedBox(height: 10),
            Row(
              children: <Widget>[
                Icon(
                  Icons.mode_comment_outlined,
                  size: 15,
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                const SizedBox(width: 6),
                Text(
                  '${advice.thread.length} сэтгэгдэл',
                  style: theme.textTheme.bodySmall,
                ),
                const Spacer(),
                Text(
                  'Дэлгэрэнгүй',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: theme.colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                Icon(
                  Icons.chevron_right_rounded,
                  size: 18,
                  color: theme.colorScheme.primary,
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  const _StatusChip({required this.closed});

  final bool closed;

  @override
  Widget build(BuildContext context) {
    final color = closed ? AppColors.textSecondary : AppColors.success;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        closed ? 'Хаагдсан' : 'Нээлттэй',
        style: TextStyle(
          fontSize: 11.5,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

/// Зөвлөгөөний дэлгэрэнгүй ба сэтгэгдлийн урсгал.
class AdviceDetailScreen extends StatelessWidget {
  const AdviceDetailScreen({super.key, required this.advice});

  final Advice advice;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final body = advice.displayBody;
    final thread = advice.thread;

    return Scaffold(
      appBar: AppBar(title: const Text('Зөвлөгөө')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
        children: <Widget>[
          Row(
            children: <Widget>[
              _StatusChip(closed: advice.closed),
              const Spacer(),
              Text(
                MnFormat.dateTime(advice.date),
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
          if ((advice.ticketType ?? '').trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            Text(
              advice.ticketType!.trim(),
              style: theme.textTheme.titleMedium,
            ),
          ],
          const SizedBox(height: 14),
          SectionCard(
            title: 'Зөвлөгөө',
            icon: Icons.tips_and_updates_outlined,
            child: Text(
              body.isEmpty ? 'Агуулга оруулаагүй байна.' : body,
              style: theme.textTheme.bodyMedium?.copyWith(
                height: 1.55,
                color: body.isEmpty ? theme.hintColor : null,
                fontStyle: body.isEmpty ? FontStyle.italic : null,
              ),
            ),
          ),
          if (thread.isNotEmpty) ...<Widget>[
            const SizedBox(height: 18),
            Text('Сэтгэгдэл', style: theme.textTheme.titleSmall),
            const SizedBox(height: 10),
            for (final comment in thread)
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: SectionCard(
                  padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        comment.comment,
                        style: theme.textTheme.bodyMedium,
                      ),
                      const SizedBox(height: 6),
                      Text(
                        MnFormat.friendlyDateTime(comment.date),
                        style: theme.textTheme.bodySmall?.copyWith(
                          fontSize: 11.5,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
          ],
          const SizedBox(height: 16),
          const PendingModuleNotice(
            title: 'Хариу бичих',
            message: 'Зөвлөгөөнд шууд хариу бичих боломж эмнэлгийн систем '
                'дээр хараахан нээгдээгүй байна. Асуух зүйл байвал '
                '"Эмчээс асуух асуулт" хэсгээр хандана уу.',
          ),
        ],
      ),
    );
  }
}
