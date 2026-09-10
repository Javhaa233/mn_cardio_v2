import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/section_card.dart';
import '../advice/advice_controller.dart';
import '../advice/advice_screen.dart';
import '../chat/chat_controller.dart';
import '../evisits/evisits_screen.dart';
import '../journal/journal_controller.dart';
import '../profile/profile_controller.dart';
import '../questions/questions_screen.dart';
import '../rehab/rehab_screen.dart';
import '../reminders/reminders_screen.dart';
import '../risk/risk_screen.dart';

/// Нүүр хуудас — үйлчлүүлэгчийн модулиудын гарц.
///
/// Тендерийн 2.1–2.7 хэсгүүд энд бүгд харагдана. Товч мэдээлэл (сүүлийн
/// хэмжилт, шинэ зөвлөгөө) дээд талд, дэлгэрэнгүй нь тус бүрийн дэлгэц дээр.
class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key, required this.onOpenJournal});

  /// Доод цэсний "Тэмдэглэл" таб руу шилжүүлэх.
  final VoidCallback onOpenJournal;

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadOnce());
  }

  void _loadOnce() {
    final profile = context.read<ProfileController>();
    if (profile.state.isIdle) profile.load();

    final journal = context.read<JournalController>();
    if (journal.state.isIdle) journal.load();

    final advice = context.read<AdviceController>();
    if (advice.state.isIdle) advice.load();

    final chat = context.read<ChatRoomsController>();
    if (chat.state.isIdle) chat.load();
  }

  Future<void> _refresh() async {
    await Future.wait<void>(<Future<void>>[
      context.read<ProfileController>().load(refresh: true),
      context.read<JournalController>().load(refresh: true),
      context.read<AdviceController>().load(refresh: true),
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
              const _Greeting(),
              const SizedBox(height: 18),
              _LatestReadingCard(onOpenJournal: widget.onOpenJournal),
              const SizedBox(height: 18),
              Text(
                'Миний хэсэг',
                style: Theme.of(context).textTheme.titleSmall,
              ),
              const SizedBox(height: 10),
              _ModuleGrid(onOpenJournal: widget.onOpenJournal),
            ],
          ),
        ),
      ),
    );
  }
}

class _Greeting extends StatelessWidget {
  const _Greeting();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final profile = context.watch<ProfileController>().profile;
    final auth = context.watch<AuthController>();
    final name = profile?.firstName.trim().isNotEmpty == true
        ? profile!.firstName.trim()
        : (auth.user?.displayName ?? '');

    final hour = DateTime.now().hour;
    final greeting = hour < 12
        ? 'Өглөөний мэнд'
        : hour < 18
            ? 'Өдрийн мэнд'
            : 'Оройн мэнд';

    return Row(
      children: <Widget>[
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                name.isEmpty ? greeting : '$greeting, $name',
                style: theme.textTheme.titleLarge,
              ),
              const SizedBox(height: 3),
              Text(
                MnFormat.longDate(DateTime.now()),
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
        ),
        IconButton(
          tooltip: 'Сануулга',
          onPressed: () => Navigator.of(context).push(
            MaterialPageRoute<void>(builder: (_) => const RemindersScreen()),
          ),
          icon: const Icon(Icons.notifications_none_rounded),
        ),
      ],
    );
  }
}

/// Хамгийн сүүлийн хэмжилтийн товч.
class _LatestReadingCard extends StatelessWidget {
  const _LatestReadingCard({required this.onOpenJournal});

  final VoidCallback onOpenJournal;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final journal = context.watch<JournalController>();
    final latest = journal.latest;

    if (journal.state.isFirstLoad) {
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

    if (latest == null) {
      return SectionCard(
        title: 'Өдөр тутмын бүртгэл',
        icon: Icons.monitor_heart_outlined,
        onTap: onOpenJournal,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              'Та хараахан хэмжилт бүртгээгүй байна. Даралт, судасны цохилт, '
              'жингээ тогтмол бүртгэснээр эмч тань биеийн байдлыг тань '
              'хянах боломжтой болно.',
              style: theme.textTheme.bodySmall,
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: onOpenJournal,
              icon: const Icon(Icons.add_rounded, size: 20),
              label: const Text('Хэмжилт бүртгэх'),
              style: FilledButton.styleFrom(
                minimumSize: const Size.fromHeight(46),
              ),
            ),
          ],
        ),
      );
    }

    return SectionCard(
      title: 'Сүүлийн хэмжилт',
      subtitle: latest.whenLabel,
      icon: Icons.monitor_heart_outlined,
      onTap: onOpenJournal,
      trailing: const Icon(Icons.chevron_right_rounded, size: 20),
      child: Row(
        children: <Widget>[
          Expanded(
            child: StatTile(
              label: 'Даралт',
              value: latest.bloodPressureLabel,
              unit: 'мм.МУБ',
              color: AppColors.chartSystolic,
              icon: Icons.favorite_outline_rounded,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: StatTile(
              label: 'Цохилт',
              value: MnFormat.number(latest.pulse, decimals: 0),
              unit: 'уд/мин',
              color: AppColors.chartPulse,
              icon: Icons.timeline_rounded,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: StatTile(
              label: 'Жин',
              value: MnFormat.number(latest.weight),
              unit: 'кг',
              color: AppColors.chartWeight,
              icon: Icons.scale_outlined,
            ),
          ),
        ],
      ),
    );
  }
}

class _ModuleGrid extends StatelessWidget {
  const _ModuleGrid({required this.onOpenJournal});

  final VoidCallback onOpenJournal;

  @override
  Widget build(BuildContext context) {
    final adviceCount = context.watch<AdviceController>().total;

    final modules = <_ModuleTileData>[
      _ModuleTileData(
        // 2.2
        label: 'Миний тэмдэглэл',
        description: 'Даралт, цохилт, жин',
        icon: Icons.event_note_outlined,
        onTap: onOpenJournal,
      ),
      _ModuleTileData(
        // 2.3
        label: 'Эмчээс асуух',
        description: 'Асуулт илгээх',
        icon: Icons.help_outline_rounded,
        onTap: () => _open(context, const QuestionsScreen()),
      ),
      _ModuleTileData(
        // 2.4
        label: 'Эмчийн зөвлөгөө',
        description: adviceCount > 0 ? '$adviceCount зөвлөгөө' : 'Зөвлөгөө',
        icon: Icons.tips_and_updates_outlined,
        onTap: () => _open(context, const AdviceScreen()),
      ),
      _ModuleTileData(
        // 2.5
        label: 'Эрсдэл үнэлгээ',
        description: 'ЗСӨ үзүүлэлт',
        icon: Icons.assignment_outlined,
        onTap: () => _open(context, const RiskScreen()),
      ),
      _ModuleTileData(
        // 2.6
        label: 'Цахим үзлэг',
        description: 'Хүсэлт илгээх',
        icon: Icons.duo_outlined,
        onTap: () => _open(context, const EvisitsScreen()),
      ),
      _ModuleTileData(
        // 2.7
        label: 'Сэргээн засах',
        description: 'Дасгал хөдөлгөөн',
        icon: Icons.self_improvement_outlined,
        onTap: () => _open(context, const RehabScreen()),
      ),
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        // Монгол шошго урт тул өндрийг өгөөмөр авав.
        childAspectRatio: 1.42,
      ),
      itemCount: modules.length,
      itemBuilder: (BuildContext context, int index) =>
          _ModuleTile(data: modules[index]),
    );
  }

  void _open(BuildContext context, Widget screen) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => screen),
    );
  }
}

class _ModuleTileData {
  const _ModuleTileData({
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
  const _ModuleTile({required this.data});

  final _ModuleTileData data;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SectionCard(
      onTap: data.onTap,
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
            child: Icon(
              data.icon,
              size: 20,
              color: theme.colorScheme.primary,
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                data.label,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.titleSmall,
              ),
              const SizedBox(height: 2),
              Text(
                data.description,
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
