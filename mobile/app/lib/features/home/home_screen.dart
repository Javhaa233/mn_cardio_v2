import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/util/async_state.dart';
import '../../core/util/mn_format.dart';
import '../../shared/widgets/section_card.dart';
import '../advice/advice.dart';
import '../advice/advice_controller.dart';
import '../advice/advice_screen.dart';
import '../chat/chat_controller.dart';
import '../evisits/evisits_screen.dart';
import '../journal/journal_controller.dart';
import '../journal/journal_entry.dart';
import '../profile/profile_controller.dart';
import '../profile/profile_screen.dart';
import '../questions/questions_controller.dart';
import '../questions/questions_screen.dart';
import '../rehab/rehab_screen.dart';
import '../reminders/reminders_screen.dart';
import '../risk/risk_screen.dart';

/// Нүүр хуудас — вебийн `view/Patient/PatientHome.jsx`-ийн мобайл хувилбар.
///
/// Бүтэц, шошго нь вебийнхтэй ижил: мэндчилгээ, дөрвөн үзүүлэлт, хоёр
/// жагсаалт, дараа нь модулийн хавтангууд. Өвчтөн хоёр гадаргууг ээлжлэн
/// хэрэглэдэг тул нэг газар харсан зүйл нөгөөд нь өөр байрлалд байх ёсгүй.
///
/// Вебээс илүү хоёр зүйл: сануулгын хонх (Техникийн шаардлага §37), ба
/// "Сэргээн засах" хавтан — вебэд энэ нь хажуугийн цэсэнд байдаг, гар утсанд
/// тийм цэс байхгүй тул энд.
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

    final questions = context.read<QuestionsController>();
    if (questions.state.isIdle) questions.load();

    final advice = context.read<AdviceController>();
    if (advice.state.isIdle) advice.load();

    final chat = context.read<ChatRoomsController>();
    if (chat.state.isIdle) chat.load();
  }

  Future<void> _refresh() async {
    await Future.wait<void>(<Future<void>>[
      context.read<ProfileController>().load(refresh: true),
      context.read<JournalController>().load(refresh: true),
      context.read<QuestionsController>().load(refresh: true),
      context.read<AdviceController>().load(refresh: true),
      context.read<ChatRoomsController>().load(refresh: true),
    ]);
  }

  void _open(Widget screen) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => screen),
    );
  }

  @override
  Widget build(BuildContext context) {
    final journal = context.watch<JournalController>();
    final questions = context.watch<QuestionsController>();
    final advice = context.watch<AdviceController>();

    final latest = journal.latest;
    final latestDate = latest == null ? null : MnFormat.date(latest.date);
    final hasPressure =
        latest != null && (latest.systolic != null || latest.diastolic != null);

    // Вебийн тодорхойлолт хэвээр: сүүлийн таван асуултын хэд нь эмчийн
    // хариу вэ. Хоёр гадаргуу нэг тоо харуулах ёстой.
    final replies = questions.items.take(5).where((q) => q.isDoctor).length;

    final journalLoading = _isLoading(journal.state);
    final journalError = _isError(journal.state);

    final actions = <Widget>[
      _ActionTile(
        title: 'Тэмдэглэл',
        description: 'Даралт, жин, эм бүртгэх',
        icon: Icons.description,
        onTap: widget.onOpenJournal,
      ),
      _ActionTile(
        title: 'Асуулт',
        description: 'Эмчээс асуух',
        icon: Icons.chat_bubble,
        onTap: () => _open(const QuestionsScreen()),
      ),
      _ActionTile(
        title: 'Цахим үзлэг',
        description: 'Хүсэлт илгээх',
        icon: Icons.videocam,
        onTap: () => _open(const EvisitsScreen()),
      ),
      _ActionTile(
        title: 'Эмчийн зөвлөгөө',
        description: 'Эмчээс ирсэн зөвлөгөө',
        icon: Icons.record_voice_over,
        onTap: () => _open(const AdviceScreen()),
      ),
      _ActionTile(
        title: 'ЗСӨ',
        description: 'Эрсдэлээ үнэлэх',
        icon: Icons.favorite,
        onTap: () => _open(const RiskScreen()),
      ),
      _ActionTile(
        title: 'Миний бүртгэл',
        description: 'Хувийн мэдээлэл',
        icon: Icons.account_box,
        onTap: () => _open(const ProfileScreen()),
      ),
      _ActionTile(
        title: 'Сэргээн засах',
        description: 'Дасгал хөдөлгөөн',
        icon: Icons.self_improvement,
        onTap: () => _open(const RehabScreen()),
      ),
    ];

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
              const SizedBox(height: 14),
              _Pair(
                left: _StatTile(
                  title: 'Сүүлийн даралт',
                  value: hasPressure ? latest.bloodPressureLabel : null,
                  unit: 'мм.муб',
                  hint: latestDate,
                  loading: journalLoading,
                  error: journalError,
                  onTap: widget.onOpenJournal,
                ),
                right: _StatTile(
                  title: 'Судасны цохилт',
                  value: latest?.pulse == null
                      ? null
                      : MnFormat.number(latest!.pulse, decimals: 0),
                  hint: latestDate,
                  loading: journalLoading,
                  error: journalError,
                  onTap: widget.onOpenJournal,
                ),
              ),
              const SizedBox(height: 10),
              _Pair(
                left: _StatTile(
                  title: 'Жин',
                  value: latest?.weight == null
                      ? null
                      : MnFormat.number(latest!.weight),
                  unit: 'кг',
                  hint: latestDate,
                  loading: journalLoading,
                  error: journalError,
                  onTap: widget.onOpenJournal,
                ),
                right: _StatTile(
                  title: 'Эмчийн хариу',
                  value: '$replies',
                  loading: _isLoading(questions.state),
                  error: _isError(questions.state),
                  onTap: () => _open(const QuestionsScreen()),
                ),
              ),
              const SizedBox(height: 10),
              _ListCard<JournalEntry>(
                title: 'Сүүлийн тэмдэглэл',
                loading: journalLoading,
                error: journalError,
                items: journal.items.take(5).toList(growable: false),
                emptyText: 'Тэмдэглэл алга байна',
                onTap: widget.onOpenJournal,
                itemBuilder: _journalRow,
              ),
              const SizedBox(height: 10),
              _ListCard<Advice>(
                title: 'Эмчийн зөвлөгөө',
                loading: _isLoading(advice.state),
                error: _isError(advice.state),
                items: advice.items.take(5).toList(growable: false),
                emptyText: 'Зөвлөгөө алга байна',
                onTap: () => _open(const AdviceScreen()),
                itemBuilder: _adviceRow,
              ),
              const SizedBox(height: 10),
              for (var i = 0; i < actions.length; i += 2) ...<Widget>[
                _Pair(
                  left: actions[i],
                  right: i + 1 < actions.length ? actions[i + 1] : null,
                ),
                const SizedBox(height: 10),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

bool _isLoading(AsyncState<Object?> state) =>
    state.isIdle || state.isFirstLoad;

bool _isError(AsyncState<Object?> state) => state.hasError && !state.hasData;

/// Вебийн `UniCard`: гарчиг 10px 12px, бие 10px.
const EdgeInsets _tilePadding = EdgeInsets.fromLTRB(12, 10, 12, 10);

/// Вебийн жагсаалтын мөр: огноо зүүн талд, утгууд баруун талд бүдэг.
Widget _journalRow(BuildContext context, JournalEntry e) {
  final theme = Theme.of(context);
  final values = <String>[
    if (e.systolic != null || e.diastolic != null) e.bloodPressureLabel,
    if (e.pulse != null) MnFormat.number(e.pulse, decimals: 0),
    if (e.weight != null) MnFormat.number(e.weight),
  ].join(' · ');

  return Row(
    children: <Widget>[
      Text(
        MnFormat.date(e.date),
        style: theme.textTheme.bodyMedium?.copyWith(fontSize: 12.5),
      ),
      const SizedBox(width: 10),
      Expanded(
        child: Text(
          values,
          textAlign: TextAlign.right,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: theme.textTheme.bodySmall,
        ),
      ),
    ],
  );
}

/// Гарчиг (эсвэл "Асуулт") ба огноо, доор нь сүүлийн хариу.
///
/// `displayBody` нь хоосон `Body`-той тасалбар дээр эхний сэтгэгдлийг авдаг
/// тул сүүлийн хариуг `thread`-ээс авна — эс бөгөөс ганц сэтгэгдэлтэй
/// тасалбар дээр нэг текст хоёр удаа гарна.
Widget _adviceRow(BuildContext context, Advice a) {
  final theme = Theme.of(context);
  final body = a.displayBody;
  final thread = a.thread;

  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: <Widget>[
      Row(
        children: <Widget>[
          Expanded(
            child: Text(
              body.isEmpty ? 'Асуулт' : body,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodyMedium?.copyWith(fontSize: 12.5),
            ),
          ),
          const SizedBox(width: 10),
          Text(MnFormat.date(a.date), style: theme.textTheme.bodySmall),
        ],
      ),
      if (thread.isNotEmpty) ...<Widget>[
        const SizedBox(height: 2),
        Text(
          thread.last.comment,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: theme.textTheme.bodySmall,
        ),
      ],
    ],
  );
}

class _Greeting extends StatelessWidget {
  const _Greeting();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final profile = context.watch<ProfileController>().profile;
    final auth = context.watch<AuthController>();

    final fromProfile = profile?.fullName;
    final name = fromProfile != null && fromProfile != '—'
        ? fromProfile
        : (auth.user?.displayName ?? '').trim();

    return Row(
      children: <Widget>[
        Expanded(
          child: Text(
            name.isEmpty ? 'Сайн байна уу' : 'Сайн байна уу, $name',
            // Вебийн мэндчилгээ — 19/500.
            style: theme.textTheme.titleLarge?.copyWith(
              fontSize: 19,
              fontWeight: FontWeight.w500,
            ),
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

/// Хоёр хавтанг ижил өндөртэй зэрэгцүүлнэ. Сондгой тоотой үед баруун тал нь
/// хоосон үлдэж, сүүлийн хавтан хагас өргөнтэй хэвээр байна.
class _Pair extends StatelessWidget {
  const _Pair({required this.left, this.right});

  final Widget left;
  final Widget? right;

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Expanded(child: left),
          const SizedBox(width: 10),
          Expanded(child: right ?? const SizedBox.shrink()),
        ],
      ),
    );
  }
}

/// Вебийн `StatTile`: гарчигтай карт, том тоо, нэгж, доор нь огноо.
class _StatTile extends StatelessWidget {
  const _StatTile({
    required this.title,
    required this.value,
    this.unit,
    this.hint,
    required this.loading,
    required this.error,
    required this.onTap,
  });

  final String title;
  final String? value;
  final String? unit;
  final String? hint;
  final bool loading;
  final bool error;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final Widget body;
    if (loading) {
      body = const _TileLoading();
    } else if (error) {
      body = const _TileError();
    } else {
      body = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          // "118/90 мм.муб" хагас өргөнд багтахгүй бол жижгэрнэ, мөр
          // шилжихгүй.
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: <Widget>[
                Text(
                  value ?? '—',
                  // Вебийн утга — 30/500.
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontSize: 30,
                    fontWeight: FontWeight.w500,
                    height: 1.1,
                  ),
                ),
                if (unit != null) ...<Widget>[
                  const SizedBox(width: 6),
                  Text(
                    unit!,
                    style: theme.textTheme.bodySmall?.copyWith(fontSize: 13),
                  ),
                ],
              ],
            ),
          ),
          if (hint != null) ...<Widget>[
            const SizedBox(height: 4),
            Text(
              hint!,
              style: theme.textTheme.bodySmall?.copyWith(fontSize: 12),
            ),
          ],
        ],
      );
    }

    return SectionCard(
      title: title,
      onTap: onTap,
      padding: _tilePadding,
      child: body,
    );
  }
}

/// Вебийн `ListTile`: гарчигтай карт, мөр бүрийн хооронд зураас.
class _ListCard<T> extends StatelessWidget {
  const _ListCard({
    required this.title,
    required this.loading,
    required this.error,
    required this.items,
    required this.emptyText,
    required this.itemBuilder,
    this.onTap,
  });

  final String title;
  final bool loading;
  final bool error;
  final List<T> items;
  final String emptyText;
  final Widget Function(BuildContext context, T item) itemBuilder;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final Widget body;
    if (loading) {
      body = const _TileLoading();
    } else if (error) {
      body = const _TileError();
    } else if (items.isEmpty) {
      body = Text(emptyText, style: theme.textTheme.bodySmall);
    } else {
      body = Column(
        children: <Widget>[
          for (var i = 0; i < items.length; i++) ...<Widget>[
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 7),
              child: itemBuilder(context, items[i]),
            ),
            if (i != items.length - 1) const Divider(height: 1),
          ],
        ],
      );
    }

    return SectionCard(
      title: title,
      onTap: onTap,
      padding: _tilePadding,
      child: body,
    );
  }
}

/// Вебийн `ActionTile`: гарчигтай карт, доор нь бүдэг дүрс ба тайлбар.
class _ActionTile extends StatelessWidget {
  const _ActionTile({
    required this.title,
    required this.description,
    required this.icon,
    required this.onTap,
  });

  final String title;
  final String description;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final muted = theme.textTheme.bodySmall?.color;

    return SectionCard(
      title: title,
      onTap: onTap,
      padding: _tilePadding,
      child: Row(
        children: <Widget>[
          Icon(icon, size: 22, color: muted),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              description,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodySmall,
            ),
          ),
        ],
      ),
    );
  }
}

class _TileLoading extends StatelessWidget {
  const _TileLoading();

  @override
  Widget build(BuildContext context) {
    return const SizedBox(
      height: 38,
      child: Align(
        alignment: Alignment.centerLeft,
        child: SizedBox(
          width: 18,
          height: 18,
          child: CircularProgressIndicator(strokeWidth: 2.2),
        ),
      ),
    );
  }
}

class _TileError extends StatelessWidget {
  const _TileError();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Text(
      'Мэдээлэл ачаалахад алдаа гарлаа',
      style: theme.textTheme.bodySmall?.copyWith(
        color: theme.colorScheme.error,
      ),
    );
  }
}
