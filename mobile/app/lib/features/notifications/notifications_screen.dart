import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/paged_list_view.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'notifications_controller.dart';

/// Техникийн шаардлага §2.1 — "Бүх төрлийн мэдэгдлүүд ирдэг байна".
///
/// Push хүргэлт нь Firebase/APNs түлхүүрээс хамаарна (ЗСҮТ). Энэ дэлгэц нь
/// серверт бүртгэгдсэн мэдэгдлүүдийг харуулах бөгөөд push байхгүй ч ажиллана.
class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key, this.onOpen});

  /// Мэдэгдэл дээр дарахад холбогдох дэлгэц рүү шилжүүлэх дүрэм. Эмч,
  /// үйлчлүүлэгчийн дэлгэцүүд өөр тул дуудагч тал өгнө.
  final void Function(BuildContext context, AppNotification item)? onOpen;

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<NotificationsController>();
      if (controller.state.isIdle) controller.load();
      controller.refreshUnread();
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<NotificationsController>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Мэдэгдэл'),
        actions: <Widget>[
          if (controller.unread > 0)
            TextButton(
              onPressed: controller.markAllRead,
              child: const Text('Бүгдийг уншсан'),
            ),
        ],
      ),
      body: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: Row(
              children: <Widget>[
                ChoiceChip(
                  label: const Text('Бүгд'),
                  selected: !controller.unreadOnly,
                  onSelected: (_) => controller.setUnreadOnly(false),
                ),
                const SizedBox(width: 8),
                ChoiceChip(
                  label: Text(
                    controller.unread > 0
                        ? 'Уншаагүй (${controller.unread})'
                        : 'Уншаагүй',
                  ),
                  selected: controller.unreadOnly,
                  onSelected: (_) => controller.setUnreadOnly(true),
                ),
              ],
            ),
          ),
          Expanded(
            child: PagedListView<AppNotification>(
              controller: controller,
              loadingLabel: 'Мэдэгдэл уншиж байна…',
              empty: EmptyView(
                title: controller.unreadOnly
                    ? 'Уншаагүй мэдэгдэл алга'
                    : 'Мэдэгдэл байхгүй байна',
                message: 'Эмчийн хариу, цахим үзлэгийн цаг зэрэг мэдэгдэл '
                    'энд харагдана.',
                icon: Icons.notifications_none_rounded,
              ),
              itemBuilder: (BuildContext context, AppNotification item, _) =>
                  _NotificationTile(
                item: item,
                onTap: () {
                  controller.markRead(item);
                  widget.onOpen?.call(context, item);
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({required this.item, required this.onTap});

  final AppNotification item;
  final VoidCallback onTap;

  IconData get _icon => switch (item.action) {
        'ReplyQuestion' => Icons.question_answer_outlined,
        'EvisitScheduled' => Icons.event_available_outlined,
        'EvisitCompleted' => Icons.task_alt_outlined,
        'EvisitCancelled' => Icons.event_busy_outlined,
        'EvisitRequested' => Icons.duo_outlined,
        'AskQuestion' => Icons.help_outline_rounded,
        'Publish' || 'CreateComment' => Icons.tips_and_updates_outlined,
        'RehabAssessment' => Icons.self_improvement_outlined,
        'Reminder' => Icons.alarm_outlined,
        _ => Icons.notifications_none_rounded,
      };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final unread = !item.seen;

    return SectionCard(
      padding: const EdgeInsets.all(14),
      onTap: onTap,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: 38,
            height: 38,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: (unread ? AppColors.primary : AppColors.info)
                  .withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              _icon,
              size: 20,
              color: unread ? AppColors.primary : AppColors.info,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  item.text,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: unread ? FontWeight.w600 : FontWeight.w400,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  MnFormat.friendlyDate(item.createDate),
                  style: theme.textTheme.bodySmall?.copyWith(fontSize: 11),
                ),
              ],
            ),
          ),
          if (unread)
            Container(
              margin: const EdgeInsets.only(left: 8, top: 6),
              width: 8,
              height: 8,
              decoration: const BoxDecoration(
                color: AppColors.primary,
                shape: BoxShape.circle,
              ),
            ),
        ],
      ),
    );
  }
}
