import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/notifications/local_notifications.dart';
import '../notifications/notification_router.dart';
import '../chat/chat_controller.dart';
import '../chat/chat_rooms_screen.dart';
import 'doctor_home_screen.dart';
import 'doctor_monitoring_screen.dart';
import 'doctor_settings_screen.dart';
import 'doctor_visits_screen.dart';
import '../../shared/widgets/heart_nav_bar.dart';

/// Эмч нэвтэрсэн үеийн үндсэн бүтэц.
class DoctorShell extends StatefulWidget {
  const DoctorShell({super.key});

  @override
  State<DoctorShell> createState() => _DoctorShellState();
}

class _DoctorShellState extends State<DoctorShell> with WidgetsBindingObserver {
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
    // Токен 10 цаг амьдардаг тул эргэж нээгдэх бүрд урьдчилан сэргээнэ.
    context.read<AuthController>().ensureFresh();
    context.read<ChatRoomsController>().load(refresh: true);
  }

  void _openTab(int index) => setState(() => _index = index);

  @override
  Widget build(BuildContext context) {
    final unread = context.watch<ChatRoomsController>().totalUnread;

    return Scaffold(
      body: IndexedStack(
        index: _index,
        children: <Widget>[
          DoctorHomeScreen(onOpenTab: _openTab),
          const DoctorVisitsScreen(),
          const DoctorMonitoringScreen(),
          const ChatRoomsScreen(),
          const DoctorSettingsScreen(),
        ],
      ),
      // "Хяналт" (индекс 2) нь голын товгор зүрхэн товч; үлдсэн дөрөв нь
      // хоёр талд. Цэсний индексийг стекийн индекс рүү хөрвүүлнэ.
      bottomNavigationBar: HeartNavBar(
        selectedIndex: _index == 2 ? -1 : (_index < 2 ? _index : _index - 1),
        onSelected: (int i) => _openTab(i < 2 ? i : i + 1),
        centerIcon: Icons.monitor_heart_rounded,
        centerLabel: 'Хяналт',
        centerSelected: _index == 2,
        onCenterTap: () => _openTab(2),
        items: <HeartNavItem>[
          const HeartNavItem(
            icon: Icons.home_outlined,
            selectedIcon: Icons.home_rounded,
            label: 'Нүүр',
          ),
          const HeartNavItem(
            icon: Icons.assignment_outlined,
            selectedIcon: Icons.assignment_rounded,
            label: 'Үзлэг',
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
