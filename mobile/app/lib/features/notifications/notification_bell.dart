import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../advice/advice_screen.dart';
import '../doctor/doctor_advice_screen.dart';
import '../evisits/evisits_screen.dart';
import '../questions/questions_screen.dart';
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

  /// Гүн холбоос — `LinkObjectName` дээр салаална (API.md §2.8).
  void _open(BuildContext context, AppNotification item) {
    Widget? target;
    switch (item.linkObjectName) {
      case 'VisitComments':
        target = widget.isDoctor ? null : const QuestionsScreen();
      case 'RemoteVisit':
        target = widget.isDoctor ? null : const EvisitsScreen();
      case 'Advice':
        target = widget.isDoctor
            ? const DoctorAdviceScreen()
            : const AdviceScreen();
      default:
        target = null;
    }
    if (target == null) return;
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => target!),
    );
  }

  @override
  Widget build(BuildContext context) {
    final unread = context.watch<NotificationsController>().unread;

    return IconButton(
      tooltip: 'Мэдэгдэл',
      onPressed: () async {
        await Navigator.of(context).push(
          MaterialPageRoute<void>(
            builder: (_) => NotificationsScreen(onOpen: _open),
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
