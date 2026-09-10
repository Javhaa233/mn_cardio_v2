import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../chat/chat_controller.dart';
import '../chat/chat_rooms_screen.dart';
import '../journal/journal_screen.dart';
import '../settings/settings_screen.dart';
import 'home_screen.dart';

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
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (int value) => setState(() => _index = value),
        destinations: <Widget>[
          const NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Нүүр',
          ),
          const NavigationDestination(
            icon: Icon(Icons.event_note_outlined),
            selectedIcon: Icon(Icons.event_note_rounded),
            label: 'Тэмдэглэл',
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
    );
  }
}
