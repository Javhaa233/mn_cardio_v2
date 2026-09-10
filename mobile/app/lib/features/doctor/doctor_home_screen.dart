import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/section_card.dart';
import '../chat/chat_controller.dart';
import 'doctor_advice_screen.dart';
import 'doctor_controllers.dart';
import 'doctor_models.dart';
import 'doctor_patients_screen.dart';
import 'doctor_report_screen.dart';

/// Эмчийн нүүр хуудас.
class DoctorHomeScreen extends StatefulWidget {
  const DoctorHomeScreen({super.key, required this.onOpenTab});

  /// Доод цэсний таб руу шилжүүлэх (1 = Үзлэг, 2 = Хяналт).
  final ValueChanged<int> onOpenTab;

  @override
  State<DoctorHomeScreen> createState() => _DoctorHomeScreenState();
}

class _DoctorHomeScreenState extends State<DoctorHomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadOnce());
  }

  void _loadOnce() {
    final profile = context.read<DoctorProfileController>();
    if (profile.state.isIdle) profile.load();

    final report = context.read<DoctorReportController>();
    if (report.state.isIdle) report.load();

    final chat = context.read<ChatRoomsController>();
    if (chat.state.isIdle) chat.load();
  }

  Future<void> _refresh() async {
    await Future.wait<void>(<Future<void>>[
      context.read<DoctorProfileController>().load(refresh: true),
      context.read<DoctorReportController>().load(refresh: true),
      context.read<ChatRoomsController>().load(refresh: true),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
            children: <Widget>[
              const _DoctorGreeting(),
              const SizedBox(height: 18),
              const _SummaryCard(),
              const SizedBox(height: 18),
              Text(
                'Миний хэсэг',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 10),
              _ModuleGrid(onOpenTab: widget.onOpenTab),
            ],
          ),
        ),
      ),
    );
  }
}

class _DoctorGreeting extends StatelessWidget {
  const _DoctorGreeting();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final me = context.watch<DoctorProfileController>().me;

    final hour = DateTime.now().hour;
    final greeting = hour < 12
        ? 'Өглөөний мэнд'
        : hour < 18
            ? 'Өдрийн мэнд'
            : 'Оройн мэнд';

    return Row(
      children: <Widget>[
        CircleAvatar(
          radius: 24,
          backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.12),
          child: Text(
            me?.initials ?? '—',
            style: theme.textTheme.titleMedium?.copyWith(
              color: theme.colorScheme.primary,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                me == null ? greeting : '$greeting, ${me.fullName}',
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.titleMedium,
              ),
              const SizedBox(height: 3),
              Text(
                me?.organizationName?.trim().isNotEmpty == true
                    ? me!.organizationName!.trim()
                    : MnFormat.longDate(DateTime.now()),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
        ),
      ],
    );
  }
}

/// 1.4-ийн товч тоонууд нүүрэн дээр.
class _SummaryCard extends StatelessWidget {
  const _SummaryCard();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<DoctorReportController>();
    final state = controller.state;

    if (state.isFirstLoad) {
      return const SectionCard(
        child: SizedBox(
          height: 84,
          child: Center(
            child: SizedBox(
              width: 20,
              height: 20,
              child: CircularProgressIndicator(strokeWidth: 2.2),
            ),
          ),
        ),
      );
    }

    final report = state.data ?? DoctorReport.empty;

    return SectionCard(
      title: 'Сүүлийн 30 хоног',
      icon: Icons.insights_outlined,
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute<void>(builder: (_) => const DoctorReportScreen()),
      ),
      trailing: const Icon(Icons.chevron_right_rounded, size: 20),
      child: Row(
        children: <Widget>[
          Expanded(
            child: StatTile(
              label: 'Миний үзлэг',
              value: '${report.myVisits}',
              icon: Icons.assignment_outlined,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: StatTile(
              label: 'Хяналтад',
              value: '${report.monitoredPatients}',
              color: AppColors.chartPulse,
              icon: Icons.monitor_heart_outlined,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: StatTile(
              label: 'Зөвлөгөө',
              value: '${report.adviceAuthored}',
              color: AppColors.chartWeight,
              icon: Icons.tips_and_updates_outlined,
            ),
          ),
        ],
      ),
    );
  }
}

class _ModuleGrid extends StatelessWidget {
  const _ModuleGrid({required this.onOpenTab});

  final ValueChanged<int> onOpenTab;

  @override
  Widget build(BuildContext context) {
    final modules = <_Tile>[
      _Tile(
        label: 'Миний үзлэгүүд',
        description: 'Бүртгэсэн үзлэг',
        icon: Icons.assignment_outlined,
        onTap: () => onOpenTab(1),
      ),
      _Tile(
        label: 'Миний хяналт',
        description: 'Хяналтад буй хүмүүс',
        icon: Icons.monitor_heart_outlined,
        onTap: () => onOpenTab(2),
      ),
      _Tile(
        label: 'Миний зөвлөгөө',
        description: 'Бичсэн зөвлөгөө',
        icon: Icons.tips_and_updates_outlined,
        onTap: () => _push(context, const DoctorAdviceScreen()),
      ),
      _Tile(
        label: 'Миний тайлан',
        description: 'Тоон үзүүлэлт',
        icon: Icons.insights_outlined,
        onTap: () => _push(context, const DoctorReportScreen()),
      ),
      _Tile(
        label: 'Үйлчлүүлэгч хайх',
        description: 'РД, нэрээр',
        icon: Icons.person_search_outlined,
        onTap: () => _push(context, const DoctorPatientsScreen()),
      ),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.42,
      ),
      itemCount: modules.length,
      itemBuilder: (BuildContext context, int index) =>
          _ModuleTile(tile: modules[index]),
    );
  }

  void _push(BuildContext context, Widget screen) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => screen),
    );
  }
}

class _Tile {
  const _Tile({
    required this.label,
    required this.description,
    required this.icon,
    required this.onTap,
  });

  final String label;
  final String description;
  final IconData icon;
  final VoidCallback onTap;
}

class _ModuleTile extends StatelessWidget {
  const _ModuleTile({required this.tile});

  final _Tile tile;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SectionCard(
      onTap: tile.onTap,
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: <Widget>[
          Container(
            width: 40,
            height: 40,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(11),
            ),
            child: Icon(tile.icon, size: 20, color: theme.colorScheme.primary),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                tile.label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.titleSmall,
              ),
              const SizedBox(height: 2),
              Text(
                tile.description,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodySmall?.copyWith(fontSize: 12),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
