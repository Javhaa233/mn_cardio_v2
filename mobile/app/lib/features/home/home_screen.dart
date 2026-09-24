import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/util/async_state.dart';
import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/theme/app_theme.dart';
import '../../shared/widgets/section_card.dart';
import '../advice/advice.dart';
import '../advice/advice_controller.dart';
import '../advice/advice_screen.dart';
import '../chat/chat_controller.dart';
import '../diagnostics/diagnostics_screen.dart';
import '../evisits/evisits_screen.dart';
import '../journal/journal_controller.dart';
import '../journal/journal_entry.dart';
import '../profile/profile_controller.dart';
import '../profile/profile_screen.dart';
import '../questions/questions_controller.dart';
import '../questions/questions_screen.dart';
import '../rehab/rehab_screen.dart';
import '../notifications/notification_bell.dart';
import '../reminders/reminders_screen.dart';
import '../risk/risk_screen.dart';

/// Нүүр хуудас — HeartFit маягийн самбар (2026-09-22).
///
/// Шошго, тоо нь вебийн `view/Patient/PatientHome.jsx`-тэй ижил хэвээр
/// (дөрвөн үзүүлэлт, хоёр жагсаалт, модулийн хавтангууд) — зөвхөн
/// байршил, хэв маяг нь өөр: градиент "Сүүлийн хэмжилт" карт, өнгөт
/// дүрстэй модулийн тор, дараа нь жагсаалтууд.
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
        icon: Icons.description_rounded,
        color: AppColors.tileRose,
        onTap: widget.onOpenJournal,
      ),
      _ActionTile(
        title: 'Асуулт',
        description: 'Эмчээс асуух',
        icon: Icons.chat_bubble_rounded,
        color: AppColors.tileBlue,
        onTap: () => _open(const QuestionsScreen()),
      ),
      _ActionTile(
        title: 'Цахим үзлэг',
        description: 'Хүсэлт илгээх',
        icon: Icons.videocam_rounded,
        color: AppColors.tileViolet,
        onTap: () => _open(const EvisitsScreen()),
      ),
      _ActionTile(
        title: 'Шинжилгээ',
        description: 'Лаборатори, эхо, ЗЦБ',
        icon: Icons.science_rounded,
        color: AppColors.tileTeal,
        onTap: () => _open(const DiagnosticsScreen()),
      ),
      _ActionTile(
        title: 'Эмчийн зөвлөгөө',
        description: 'Эмчээс ирсэн зөвлөгөө',
        icon: Icons.record_voice_over_rounded,
        color: AppColors.tileAmber,
        onTap: () => _open(const AdviceScreen()),
      ),
      _ActionTile(
        title: 'ЗСӨ',
        description: 'Эрсдэлээ үнэлэх',
        icon: Icons.favorite_rounded,
        color: AppColors.tileCoral,
        onTap: () => _open(const RiskScreen()),
      ),
      _ActionTile(
        title: 'Миний бүртгэл',
        description: 'Хувийн мэдээлэл',
        icon: Icons.account_box_rounded,
        color: AppColors.tileIndigo,
        onTap: () => _open(const ProfileScreen()),
      ),
      _ActionTile(
        title: 'Сэргээн засах',
        description: 'Дасгал хөдөлгөөн',
        icon: Icons.self_improvement_rounded,
        color: AppColors.tileGreen,
        onTap: () => _open(const RehabScreen()),
      ),
    ];

    return Scaffold(
      body: DecoratedBox(
        // HeartFit-ийн дэвсгэр: дээрээ зөөлөн ягаан туяа, доошоо цайвар.
        decoration: const BoxDecoration(gradient: AppColors.canvasGradient),
        child: SafeArea(
          bottom: false,
          child: RefreshIndicator(
            onRefresh: _refresh,
            child: ListView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
              children: <Widget>[
                const _Greeting(),
                const SizedBox(height: 16),
                _LastMeasurementCard(
                  entry: latest,
                  hasPressure: hasPressure,
                  date: latestDate,
                  loading: journalLoading,
                  error: journalError,
                  onTap: widget.onOpenJournal,
                ),
                const SizedBox(height: 12),
                _RepliesCard(
                  replies: replies,
                  loading: _isLoading(questions.state),
                  error: _isError(questions.state),
                  onTap: () => _open(const QuestionsScreen()),
                ),
                const SizedBox(height: 22),
                const _SectionTitle('Үйлчилгээ'),
                const SizedBox(height: 10),
                for (var i = 0; i < actions.length; i += 2) ...<Widget>[
                  _Pair(
                    left: actions[i],
                    right: i + 1 < actions.length ? actions[i + 1] : null,
                  ),
                  const SizedBox(height: 12),
                ],
                const SizedBox(height: 10),
                _ListCard<JournalEntry>(
                  title: 'Сүүлийн тэмдэглэл',
                  icon: Icons.event_note_rounded,
                  loading: journalLoading,
                  error: journalError,
                  items: journal.items.take(5).toList(growable: false),
                  emptyText: 'Тэмдэглэл алга байна',
                  onTap: widget.onOpenJournal,
                  itemBuilder: _journalRow,
                ),
                const SizedBox(height: 12),
                _ListCard<Advice>(
                  title: 'Эмчийн зөвлөгөө',
                  icon: Icons.record_voice_over_rounded,
                  loading: _isLoading(advice.state),
                  error: _isError(advice.state),
                  items: advice.items.take(5).toList(growable: false),
                  emptyText: 'Зөвлөгөө алга байна',
                  onTap: () => _open(const AdviceScreen()),
                  itemBuilder: _adviceRow,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

bool _isLoading(AsyncState<Object?> state) =>
    state.isIdle || state.isFirstLoad;

bool _isError(AsyncState<Object?> state) => state.hasError && !state.hasData;

/// Жагсаалтын картны доторх зай.
const EdgeInsets _tilePadding = EdgeInsets.fromLTRB(16, 14, 16, 12);

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
/// `displayBody` нь хоосон `Body`-той асуумж дээр эхний сэтгэгдлийг авдаг
/// тул сүүлийн хариуг `thread`-ээс авна — эс бөгөөс ганц сэтгэгдэлтэй
/// асуумж дээр нэг текст хоёр удаа гарна.
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
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                'МнКардио',
                style: theme.textTheme.headlineSmall?.copyWith(fontSize: 26),
              ),
              const SizedBox(height: 2),
              Text(
                name.isEmpty ? 'Сайн байна уу' : 'Сайн байна уу, $name',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.textTheme.bodySmall?.color,
                ),
              ),
            ],
          ),
        ),
        _RoundIcon(
          tooltip: 'Сануулга',
          icon: Icons.alarm_rounded,
          onPressed: () => Navigator.of(context).push(
            MaterialPageRoute<void>(builder: (_) => const RemindersScreen()),
          ),
        ),
        const SizedBox(width: 8),
        const _RoundBell(),
      ],
    );
  }
}

/// Цагаан дугуй дүрс товч — HeartFit-ийн толгойн тохиргооны товч.
class _RoundIcon extends StatelessWidget {
  const _RoundIcon({
    required this.tooltip,
    required this.icon,
    required this.onPressed,
  });

  final String tooltip;
  final IconData icon;
  final VoidCallback onPressed;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: theme.colorScheme.surface,
      shape: const CircleBorder(),
      elevation: theme.brightness == Brightness.dark ? 0 : 2,
      shadowColor: AppTheme.shadowInk,
      child: IconButton(
        tooltip: tooltip,
        onPressed: onPressed,
        icon: Icon(icon, color: theme.textTheme.bodyLarge?.color),
      ),
    );
  }
}

class _RoundBell extends StatelessWidget {
  const _RoundBell();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Material(
      color: theme.colorScheme.surface,
      shape: const CircleBorder(),
      elevation: theme.brightness == Brightness.dark ? 0 : 2,
      shadowColor: AppTheme.shadowInk,
      child: const NotificationBell(),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.text);

  final String text;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(text, style: Theme.of(context).textTheme.titleLarge),
    );
  }
}

/// HeartFit-ийн "Last Measurement" карт — градиент дэвсгэр дээр сүүлийн
/// даралт том тоогоор, доор нь судасны цохилт, жин.
///
/// Эмнэлзүйн ангилал (хэвийн / өндөр) **зориуд харуулаагүй**: даралтын
/// ангиллын босгыг ЗСҮТ батлаагүй байна (CLAUDE.md §9 "Ask, don't invent").
class _LastMeasurementCard extends StatelessWidget {
  const _LastMeasurementCard({
    required this.entry,
    required this.hasPressure,
    required this.date,
    required this.loading,
    required this.error,
    required this.onTap,
  });

  final JournalEntry? entry;
  final bool hasPressure;
  final String? date;
  final bool loading;
  final bool error;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    const white = Colors.white;
    final dim = Colors.white.withValues(alpha: 0.86);
    final e = entry;

    Widget content;
    if (loading) {
      content = const SizedBox(
        height: 96,
        child: Center(
          child: SizedBox(
            width: 22,
            height: 22,
            child: CircularProgressIndicator(strokeWidth: 2.4, color: white),
          ),
        ),
      );
    } else if (error) {
      content = SizedBox(
        height: 96,
        child: Center(
          child: Text(
            'Мэдээлэл ачаалахад алдаа гарлаа',
            style: theme.textTheme.bodyMedium?.copyWith(color: white),
          ),
        ),
      );
    } else if (e == null) {
      content = Padding(
        padding: const EdgeInsets.symmetric(vertical: 14),
        child: Text(
          'Хэмжилт алга байна. Доорх зүрхэн товчоор даралтаа бүртгээрэй.',
          style: theme.textTheme.bodyLarge?.copyWith(
            color: white,
            fontWeight: FontWeight.w600,
          ),
        ),
      );
    } else {
      content = Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          FittedBox(
            fit: BoxFit.scaleDown,
            alignment: Alignment.centerLeft,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.baseline,
              textBaseline: TextBaseline.alphabetic,
              children: <Widget>[
                Text(
                  hasPressure ? e.bloodPressureLabel : '—',
                  style: const TextStyle(
                    color: white,
                    fontSize: 46,
                    fontWeight: FontWeight.w800,
                    height: 1.05,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  'мм.муб',
                  style: TextStyle(
                    color: dim,
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.16),
              borderRadius: BorderRadius.circular(AppTheme.controlRadius),
            ),
            child: Row(
              children: <Widget>[
                Expanded(
                  child: _HeroStat(
                    label: 'Судасны цохилт',
                    value: e.pulse == null
                        ? '—'
                        : MnFormat.number(e.pulse, decimals: 0),
                    unit: 'цох/мин',
                  ),
                ),
                Container(
                  width: 1,
                  height: 34,
                  color: Colors.white.withValues(alpha: 0.3),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: _HeroStat(
                    label: 'Жин',
                    value: e.weight == null ? '—' : MnFormat.number(e.weight),
                    unit: 'кг',
                  ),
                ),
              ],
            ),
          ),
        ],
      );
    }

    return GradientHeroCard(
      onTap: onTap,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              const Icon(Icons.favorite_rounded, color: white, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Сүүлийн хэмжилт',
                  style: theme.textTheme.titleMedium?.copyWith(
                    color: white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              if (date != null)
                Text(
                  date!,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: dim,
                    fontWeight: FontWeight.w600,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          content,
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: <Widget>[
              Text(
                'Бүгдийг харах',
                style: theme.textTheme.labelLarge?.copyWith(
                  color: white,
                  decoration: TextDecoration.underline,
                  decorationColor: white,
                ),
              ),
              const SizedBox(width: 4),
              const Icon(Icons.arrow_forward_rounded, color: white, size: 18),
            ],
          ),
        ],
      ),
    );
  }
}

class _HeroStat extends StatelessWidget {
  const _HeroStat({
    required this.label,
    required this.value,
    required this.unit,
  });

  final String label;
  final String value;
  final String unit;

  @override
  Widget build(BuildContext context) {
    final dim = Colors.white.withValues(alpha: 0.86);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          label,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(color: dim, fontSize: 12.5, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 2),
        FittedBox(
          fit: BoxFit.scaleDown,
          alignment: Alignment.centerLeft,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: <Widget>[
              Text(
                value,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  height: 1.15,
                ),
              ),
              const SizedBox(width: 4),
              Text(unit, style: TextStyle(color: dim, fontSize: 12.5)),
            ],
          ),
        ),
      ],
    );
  }
}

/// "Эмчийн хариу" — сүүлийн таван асуултын хэд нь эмчийн хариу вэ.
class _RepliesCard extends StatelessWidget {
  const _RepliesCard({
    required this.replies,
    required this.loading,
    required this.error,
    required this.onTap,
  });

  final int replies;
  final bool loading;
  final bool error;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    final Widget trailing;
    if (loading) {
      trailing = const SizedBox(
        width: 18,
        height: 18,
        child: CircularProgressIndicator(strokeWidth: 2.2),
      );
    } else if (error) {
      trailing = Icon(Icons.error_outline_rounded, color: theme.colorScheme.error);
    } else {
      trailing = Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: theme.colorScheme.primaryContainer,
          borderRadius: BorderRadius.circular(999),
        ),
        child: Text(
          '$replies',
          style: theme.textTheme.titleMedium?.copyWith(
            color: theme.colorScheme.onPrimaryContainer,
            fontWeight: FontWeight.w800,
          ),
        ),
      );
    }

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
          child: Row(
            children: <Widget>[
              const IconBubble(
                icon: Icons.mark_chat_read_rounded,
                color: AppColors.tileBlue,
                size: 42,
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text('Эмчийн хариу', style: theme.textTheme.titleMedium),
                    Text(
                      'Сүүлийн 5 асуултаас',
                      style: theme.textTheme.bodySmall,
                    ),
                  ],
                ),
              ),
              trailing,
              const SizedBox(width: 4),
              Icon(
                Icons.chevron_right_rounded,
                color: theme.textTheme.bodySmall?.color,
              ),
            ],
          ),
        ),
      ),
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

/// Вебийн `ListTile`: гарчигтай карт, мөр бүрийн хооронд зураас.
class _ListCard<T> extends StatelessWidget {
  const _ListCard({
    required this.title,
    this.icon,
    required this.loading,
    required this.error,
    required this.items,
    required this.emptyText,
    required this.itemBuilder,
    this.onTap,
  });

  final String title;
  final IconData? icon;
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
      icon: icon,
      onTap: onTap,
      padding: _tilePadding,
      trailing: onTap == null
          ? null
          : Icon(
              Icons.chevron_right_rounded,
              color: theme.textTheme.bodySmall?.color,
            ),
      child: body,
    );
  }
}

/// HeartFit-ийн "Export Data" торны хавтан: өнгөт дүрсний бөмбөлөг, тод
/// гарчиг, бүдэг тайлбар.
class _ActionTile extends StatelessWidget {
  const _ActionTile({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.onTap,
  });

  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(14, 16, 14, 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              IconBubble(icon: icon, color: color, size: 46),
              const SizedBox(height: 12),
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.titleMedium,
              ),
              const SizedBox(height: 2),
              Text(
                description,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
        ),
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
