import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'notification_link.dart';
import 'notifications_controller.dart';
import 'notifications_screen.dart';

/// Уншаагүй мэдэгдлийн тоог харуулах хонх.
///
/// Эмч, үйлчлүүлэгч аль алинд нь тохирно: аль дэлгэц рүү шилжихийг [isDoctor]
/// шийднэ.
class NotificationBell extends StatefulWidget {
  const NotificationBell({super.key, this.isDoctor = false});

  final bool isDoctor;

  @override
  State<NotificationBell> createState() => _NotificationBellState();
}

class _NotificationBellState extends State<NotificationBell> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<NotificationsController>().refreshUnread();
    });
  }

  @override
  Widget build(BuildContext context) {
    final unread = context.watch<NotificationsController>().unread;

    return IconButton(
      tooltip: 'Мэдэгдэл',
      onPressed: () async {
        await Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => NotificationsScreen(
              onOpen: (BuildContext ctx, AppNotification item) =>
                  openNotification(ctx, item, isDoctor: widget.isDoctor),
            ),
          ),
        );
        if (!context.mounted) return;
        await context.read<NotificationsController>().refreshUnread();
      },
      icon: Badge(
        isLabelVisible: unread > 0,
        label: Text(unread > 99 ? '99+' : '$unread'),
        child: const Icon(Icons.notifications_none_rounded),
      ),
    );
  }
}
