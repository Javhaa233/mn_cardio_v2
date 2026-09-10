import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../chat/chat_controller.dart';
import '../chat/chat_rooms_screen.dart';
import 'doctor_home_screen.dart';
import 'doctor_monitoring_screen.dart';
import 'doctor_settings_screen.dart';
import 'doctor_visits_screen.dart';
import '../../shared/theme/app_colors.dart';

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
      // Вебийн хажуугийн цэсний градиент. NavigationBar өөрөө градиент
      // авдаггүй тул дэвсгэрийг энд зурж, самбарыг тунгалаг үлдээв.
      bottomNavigationBar: DecoratedBox(
        decoration: const BoxDecoration(gradient: AppColors.navGradient),
        child: NavigationBar(
          selectedIndex: _index,
          onDestinationSelected: _openTab,
          destinations: <Widget>[
            const NavigationDestination(
              icon: Icon(Icons.home_outlined),
              selectedIcon: Icon(Icons.home_rounded),
              label: 'Нүүр',
            ),
            const NavigationDestination(
              icon: Icon(Icons.assignment_outlined),
              selectedIcon: Icon(Icons.assignment_rounded),
              label: 'Үзлэг',
            ),
            const NavigationDestination(
              icon: Icon(Icons.monitor_heart_outlined),
              selectedIcon: Icon(Icons.monitor_heart_rounded),
              label: 'Хяналт',
            ),
            NavigationDestination(
              icon: Badge(
                isLabelVisible: unread > 0,
                label: Text(unread > 99 ? '99+' : '$unread'),
                child: const Icon(Icons.chat_bubble_outline_rounded),
              ),
              selectedIcon: Badge(
                isLabelVisible: unread > 0,
                label: Text(unread > 99 ? '99+' : '$unread'),
                child: const Icon(Icons.chat_bubble_rounded),
              ),
              label: 'Чат',
            ),
            const NavigationDestination(
              icon: Icon(Icons.person_outline_rounded),
              selectedIcon: Icon(Icons.person_rounded),
              label: 'Цэс',
            ),
          ],
        ),
      ),
    );
  }
}
