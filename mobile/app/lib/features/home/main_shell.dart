import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/notifications/local_notifications.dart';
import '../chat/chat_controller.dart';
import '../chat/chat_rooms_screen.dart';
import '../journal/journal_controller.dart';
import '../journal/journal_form_screen.dart';
import '../journal/journal_screen.dart';
import '../notifications/notification_router.dart';
import '../settings/settings_screen.dart';
import 'home_screen.dart';
import '../../shared/widgets/heart_nav_bar.dart';

/// Нэвтэрсэн үеийн үндсэн бүтэц — доод цэс.
class MainShell extends StatefulWidget {
  const MainShell({super.key});

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> with WidgetsBindingObserver {
  int _index = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    // Апп хаалттай байхад мэдэгдэл дээр дарсан бол тэр хэсэг рүү нь очно.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final payload = LocalNotifications.takeLaunchPayload();
      if (payload != null) routeNotificationPayload(payload);
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state != AppLifecycleState.resumed) return;
    // Хандах эрхийн токен 10 цаг амьдардаг тул апп эргэж нээгдэх бүрд
    // хугацаа дуусахаас өмнө урьдчилан сэргээнэ — 401 хүлээхгүй.
    context.read<AuthController>().ensureFresh();
    // Socket ард ажиллах үед тасардаг тул чатыг дахин татна.
    context.read<ChatRoomsController>().load(refresh: true);
  }

  void _openJournal() => setState(() => _index = 1);

  /// Төв зүрхэн товч — даралт, судасны цохилт, жин нэмэх. HeartFit-ийн
  /// "Measure" товчны дүйцэл: өвчтөний хамгийн олон давтагддаг үйлдэл.
  Future<void> _openMeasure() async {
    final saved = await Navigator.of(context).push<bool>(
      MaterialPageRoute<bool>(builder: (_) => const JournalFormScreen()),
    );
    if (saved == true && mounted) {
      context.read<JournalSummaryController>().load(refresh: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final unread = context.watch<ChatRoomsController>().totalUnread;

    return Scaffold(
      body: IndexedStack(
        index: _index,
        children: <Widget>[
          HomeScreen(onOpenJournal: _openJournal),
          const JournalScreen(),
          const ChatRoomsScreen(),
          const SettingsScreen(),
        ],
      ),
      bottomNavigationBar: HeartNavBar(
        selectedIndex: _index,
        onSelected: (int value) => setState(() => _index = value),
        centerIcon: Icons.monitor_heart_rounded,
        centerLabel: 'Хэмжих',
        onCenterTap: _openMeasure,
        items: <HeartNavItem>[
          const HeartNavItem(
            icon: Icons.home_outlined,
            selectedIcon: Icons.home_rounded,
            label: 'Нүүр',
          ),
          const HeartNavItem(
            icon: Icons.event_note_outlined,
            selectedIcon: Icons.event_note_rounded,
            label: 'Тэмдэглэл',
          ),
          HeartNavItem(
            icon: Icons.chat_bubble_outline_rounded,
            selectedIcon: Icons.chat_bubble_rounded,
            label: 'Чат',
            badge: unread,
          ),
          const HeartNavItem(
            icon: Icons.person_outline_rounded,
            selectedIcon: Icons.person_rounded,
            label: 'Цэс',
          ),
        ],
      ),
    );
  }
}
