import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_client.dart';
import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/attachment_view.dart';
import '../../shared/widgets/paged_list_view.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'doctor_controllers.dart';
import 'doctor_models.dart';
import 'doctor_repository.dart';

/// 1.3 Миний зөвлөгөө — эмчийн өөрийн бичсэн асуумжууд.
///
/// Энэ нь **байгууллагын нийтийн хана биш**, зөвхөн зохиогчийн өөрийн бичлэг.
/// Нийтийн хана нь өөрийн харагдах байдлын дүрэмтэй бөгөөд вэб хувилбарт
/// үлдсэн (API.md §6).
class DoctorAdviceScreen extends StatefulWidget {
  const DoctorAdviceScreen({super.key});

  @override
  State<DoctorAdviceScreen> createState() => _DoctorAdviceScreenState();
}

class _DoctorAdviceScreenState extends State<DoctorAdviceScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<DoctorAdviceController>();
      if (controller.state.isIdle) controller.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<DoctorAdviceController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Миний зөвлөгөө')),
      body: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              children: <Widget>[
                for (final filter in AdviceFilter.values) ...<Widget>[
                  ChoiceChip(
                    label: Text(filter.label),
                    selected: controller.filter == filter,
                    onSelected: (_) => controller.setFilter(filter),
                  ),
                  const SizedBox(width: 8),
                ],
              ],
            ),
          ),
          Expanded(
            child: PagedListView<DoctorAdvice>(
              controller: controller,
              loadingLabel: 'Зөвлөгөө уншиж байна…',
              itemBuilder: (BuildContext context, DoctorAdvice advice, _) =>
                  _AdviceTile(advice: advice),
              empty: EmptyView(
                title: controller.filter == AdviceFilter.drafts
                    ? 'Ноорог байхгүй байна'
                    : 'Зөвлөгөө байхгүй байна',
                message: 'Таны бичсэн зөвлөгөө энд харагдана. Шинэ зөвлөгөө '
                    'бичихийг МнКардио системийн вэб хувилбараар гүйцэтгэнэ.',
                icon: Icons.tips_and_updates_outlined,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class AdviceStatusChip extends StatelessWidget {
  const AdviceStatusChip({super.key, required this.status});

  final AdviceStatus status;

  @override
  Widget build(BuildContext context) {
    final color = switch (status) {
      AdviceStatus.open => AppColors.success,
      AdviceStatus.closed => AppColors.textSecondary,
      AdviceStatus.draft => AppColors.warning,
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        status.label,
        style: TextStyle(
          fontSize: 11.5,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

class _AdviceTile extends StatelessWidget {
  const _AdviceTile({required this.advice});

  final DoctorAdvice advice;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SectionCard(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => DoctorAdviceDetailScreen(adviceId: advice.idData),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              AdviceStatusChip(status: advice.status),
              if ((advice.ticketType ?? '').trim().isNotEmpty) ...<Widget>[
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    advice.ticketType!.trim(),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall,
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
            advice.hasBody
                ? advice.body.trim()
                : 'Агуулга нь хариу дотор байна — нээж үзнэ үү.',
            maxLines: 3,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: advice.hasBody ? null : theme.hintColor,
              fontStyle: advice.hasBody ? null : FontStyle.italic,
            ),
          ),
          const SizedBox(height: 9),
          Row(
            children: <Widget>[
              Icon(
                Icons.mode_comment_outlined,
                size: 15,
                color: theme.colorScheme.onSurfaceVariant,
              ),
              const SizedBox(width: 6),
              Text(
                '${advice.commentCount} хариу',
                style: theme.textTheme.bodySmall,
              ),
              const Spacer(),
              const Icon(Icons.chevron_right_rounded, size: 18),
            ],
          ),
        ],
      ),
    );
  }
}

/// Зөвлөгөөний дэлгэрэнгүй ба хариунууд.
class DoctorAdviceDetailScreen extends StatefulWidget {
  const DoctorAdviceDetailScreen({super.key, required this.adviceId});

  final int adviceId;

  @override
  State<DoctorAdviceDetailScreen> createState() =>
      _DoctorAdviceDetailScreenState();
}

class _DoctorAdviceDetailScreenState extends State<DoctorAdviceDetailScreen> {
  late final DoctorAdviceDetailController _controller;

  @override
  void initState() {
    super.initState();
    _controller = DoctorAdviceDetailController(
      context.read<DoctorRepository>(),
      widget.adviceId,
    );
    _controller.load();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Зөвлөгөө')),
      body: ListenableBuilder(
        listenable: _controller,
        builder: (BuildContext context, _) {
          final state = _controller.state;

          if (state.isFirstLoad) {
            return const LoadingView(label: 'Уншиж байна…');
          }
          if (state.hasError && !state.hasData) {
            return ErrorView(
              error: state.error!,
              onRetry: () => _controller.load(refresh: true),
            );
          }

          final detail = state.data;
          if (detail == null) {
            return const EmptyView(
              title: 'Зөвлөгөө олдсонгүй',
              message: 'Энэ бичлэг устсан эсвэл өөр эмчийн бичлэг байна.',
              icon: Icons.tips_and_updates_outlined,
            );
          }

          final body = detail.displayBody;

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
            children: <Widget>[
              Row(
                children: <Widget>[
                  AdviceStatusChip(status: detail.ticket.status),
                  const Spacer(),
                  Text(
                    MnFormat.dateTime(detail.ticket.date),
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ),
              if ((detail.ticket.ticketType ?? '').trim().isNotEmpty) ...<Widget>[
                const SizedBox(height: 12),
                Text(
                  detail.ticket.ticketType!.trim(),
                  style: theme.textTheme.titleMedium,
                ),
              ],
              const SizedBox(height: 14),
              SectionCard(
                title: 'Агуулга',
                icon: Icons.tips_and_updates_outlined,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      body.isEmpty ? 'Агуулга оруулаагүй байна.' : body,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        height: 1.55,
                        color: body.isEmpty ? theme.hintColor : null,
                        fontStyle: body.isEmpty ? FontStyle.italic : null,
                      ),
                    ),
                    for (final file in detail.displayFiles)
                      AttachmentChip(
                        attachment: file,
                        api: context.read<ApiClient>(),
                      ),
                  ],
                ),
              ),
              if (detail.thread.isNotEmpty) ...<Widget>[
                const SizedBox(height: 18),
                Text('Хариунууд', style: theme.textTheme.titleSmall),
                const SizedBox(height: 10),
                for (final comment in detail.thread)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: SectionCard(
                      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          if (comment.comment.trim().isNotEmpty)
                            Text(
                              comment.comment,
                              style: theme.textTheme.bodyMedium,
                            ),
                          for (final file in comment.files)
                            AttachmentChip(
                              attachment: file,
                              api: context.read<ApiClient>(),
                            ),
                          const SizedBox(height: 6),
                          Text(
                            MnFormat.friendlyDateTime(comment.date),
                            style: theme.textTheme.bodySmall
                                ?.copyWith(fontSize: 11.5),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
              const SizedBox(height: 14),
              const PendingModuleNotice(
                title: 'Хариу бичих',
                message: 'Зөвлөгөө нийтлэх, хариу бичих үйлдэл эмнэлзүйн '
                    'бичилтэд тооцогддог тул гар утаснаас хийгдэхгүй. '
                    'МнКардио системийн вэб хувилбараар үргэлжлүүлнэ үү.',
                icon: Icons.edit_off_outlined,
              ),
            ],
          );
        },
      ),
    );
  }
}
