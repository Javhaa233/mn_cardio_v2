import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/theme/app_theme.dart';
import '../../shared/widgets/section_card.dart';
import '../chat/chat_controller.dart';
import '../chat/chat_models.dart';
import '../chat/chat_repository.dart';
import '../chat/doctor_search_screen.dart';
import 'doctor_controllers.dart';
import 'doctor_models.dart';
import 'doctor_report_screen.dart';
import 'feed_widgets.dart';
import 'ticket_composer_screen.dart';

/// Эмчийн нүүр хуудас.
class DoctorHomeScreen extends StatefulWidget {
  const DoctorHomeScreen({super.key, required this.onOpenTab});

  /// Доод цэсний таб руу шилжүүлэх (1 = Үзлэг, 2 = Хяналт).
  final ValueChanged<int> onOpenTab;

  @override
  State<DoctorHomeScreen> createState() => _DoctorHomeScreenState();
}

class _DoctorHomeScreenState extends State<DoctorHomeScreen> {
  final ScrollController _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_onScroll);
    WidgetsBinding.instance.addPostFrameCallback((_) => _loadOnce());
  }

  @override
  void dispose() {
    _scroll
      ..removeListener(_onScroll)
      ..dispose();
    super.dispose();
  }

  void _loadOnce() {
    final profile = context.read<DoctorProfileController>();
    if (profile.state.isIdle) profile.load();

    final report = context.read<DoctorReportController>();
    if (report.state.isIdle) report.load();

    final chat = context.read<ChatRoomsController>();
    if (chat.state.isIdle) chat.load();

    final feed = context.read<DoctorFeedController>();
    if (feed.state.isIdle) feed.load();
  }

  /// Тасалбарын урсгал нүүр хуудасны хамгийн доор тул төгсгөлд ойртоход
  /// дараагийн хуудсыг татна — вебийн хязгааргүй гүйлгэлттэй ижил.
  void _onScroll() {
    if (!_scroll.hasClients) return;
    if (_scroll.position.extentAfter < 800) {
      context.read<DoctorFeedController>().loadMore();
    }
  }

  Future<void> _refresh() async {
    await Future.wait<void>(<Future<void>>[
      context.read<DoctorProfileController>().load(refresh: true),
      context.read<DoctorReportController>().load(refresh: true),
      context.read<ChatRoomsController>().load(refresh: true),
      context.read<DoctorFeedController>().load(refresh: true),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final feed = context.watch<DoctorFeedController>();

    return Scaffold(
      body: SafeArea(
        bottom: false,
        child: RefreshIndicator(
          onRefresh: _refresh,
          child: ListView(
            controller: _scroll,
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
            children: <Widget>[
              const _DoctorGreeting(),
              const SizedBox(height: 16),
              const _DoctorSearchHero(),
              const SizedBox(height: 12),
              const _ComposerCard(),
              const SizedBox(height: 18),
              const _SummaryCard(),
              // "Миний хэсэг"-ийн 5 хавтанг хассан (2026-09-11): Үзлэг, Хяналт нь
              // доод цэсний табууд, Миний зөвлөгөө / тайлан / Үйлчлүүлэгч хайх
              // нь "Цэс" таб дээр байгаа тул давхардал байв.
              const SizedBox(height: 26),
              // Вебийн нүүр хуудасны гол хэсэг — нийтлэгдсэн тасалбарууд.
              Row(
                children: <Widget>[
                  Expanded(
                    child: Text('Тасалбарууд', style: theme.textTheme.titleLarge),
                  ),
                  if (feed.isFiltered && feed.state.isReady)
                    Text('${feed.total} тасалбар', style: theme.textTheme.bodySmall),
                ],
              ),
              const SizedBox(height: 10),
              FeedFilterBar(controller: feed),
              const SizedBox(height: 12),
              ...buildFeedItems(context, feed),
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

/// "Эмч хайх" — нүүр хуудасны хамгийн дээд хэсэг.
///
/// Вебийн эмч сонгогчийн (`Chat/DoctorPicker.jsx`) гурван шүүлтүүр: аймаг/хот,
/// сум/дүүрэг, нэр-мэргэжил-байгууллага. Энд шүүлтүүрийг л бэлдэж, хайх үед
/// жагсаалтыг бүтэн дэлгэцээр нээнэ — урт жагсаалтыг нүүр хуудсан дээр
/// гүйлгэвэл доорх хэсгүүд харагдахаа болино.
///
/// Брэндийн градиент дээр. Вебэд градиент нь хажуугийн цэсэнд байдаг; гар
/// утсанд хамгийн түрүүнд харагдах энэ карт түүнийг авч явна. Цагаан бичиг
/// градиентын индиго (дээд зүүн) талд байрлана — тэнд контраст ~7:1.
class _DoctorSearchHero extends StatefulWidget {
  const _DoctorSearchHero();

  @override
  State<_DoctorSearchHero> createState() => _DoctorSearchHeroState();
}

class _DoctorSearchHeroState extends State<_DoctorSearchHero> {
  final TextEditingController _query = TextEditingController();
  DirectoryFilters _filters = DirectoryFilters.empty;
  String? _province;
  String? _soum;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _loadFilters();
    });
  }

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  Future<void> _loadFilters() async {
    try {
      final filters = await context.read<ChatRepository>().directoryFilters();
      if (!mounted) return;
      setState(() => _filters = filters);
    } catch (e) {
      // Шүүлтүүргүйгээр хайлт ажиллана; мөр л харагдахгүй.
      debugPrint('[home] directory filters failed: $e');
    }
  }

  void _search() {
    FocusScope.of(context).unfocus();
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => DoctorSearchScreen(
          initialProvince: _province,
          initialSoum: _soum,
          initialSearch: _query.text.trim(),
        ),
      ),
    );
  }

  InputDecoration _field({String? hint, Widget? prefix, Widget? suffix}) {
    final radius = BorderRadius.circular(AppTheme.controlRadius);
    return InputDecoration(
      hintText: hint,
      prefixIcon: prefix,
      suffixIcon: suffix,
      isDense: true,
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(borderRadius: radius, borderSide: BorderSide.none),
      enabledBorder:
          OutlineInputBorder(borderRadius: radius, borderSide: BorderSide.none),
      disabledBorder:
          OutlineInputBorder(borderRadius: radius, borderSide: BorderSide.none),
      // Текст бус заагч тул cyan зөвшөөрөгдөнө.
      focusedBorder: OutlineInputBorder(
        borderRadius: radius,
        borderSide: const BorderSide(color: AppColors.cyan, width: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final province = _province;
    final soums = province == null
        ? const <DirectoryPlace>[]
        : _filters.soumsOf(province);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: AppColors.brandGradient,
        borderRadius: BorderRadius.circular(AppTheme.heroRadius),
        // tokens.js § elevation.3 — navy өнгөтэй, саарал хар биш.
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: AppTheme.shadowInk,
            blurRadius: 20,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Container(
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.person_search_rounded,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'Эмч хайх',
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Улсын хэмжээнд эмчийг олж, шууд чатлана',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.white.withValues(alpha: 0.92),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (!_filters.isEmpty) ...<Widget>[
            Row(
              children: <Widget>[
                Expanded(
                  child: DropdownButtonFormField<String?>(
                    initialValue: _province,
                    isExpanded: true,
                    borderRadius: BorderRadius.circular(12),
                    decoration: _field(),
                    items: <DropdownMenuItem<String?>>[
                      const DropdownMenuItem<String?>(
                        value: null,
                        child: Text('Бүх аймаг / хот'),
                      ),
                      for (final DirectoryPlace p in _filters.provinces)
                        DropdownMenuItem<String?>(
                          value: p.name,
                          child: Text(p.label, overflow: TextOverflow.ellipsis),
                        ),
                    ],
                    onChanged: (String? value) => setState(() {
                      _province = value;
                      // Өмнөх аймгийн сум шинэд таарахгүй.
                      _soum = null;
                    }),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: DropdownButtonFormField<String?>(
                    key: ValueKey<String>('hero-soum-${province ?? ''}'),
                    initialValue: _soum,
                    isExpanded: true,
                    borderRadius: BorderRadius.circular(12),
                    decoration: _field(),
                    disabledHint: const Text(
                      'Бүх сум / дүүрэг',
                      overflow: TextOverflow.ellipsis,
                    ),
                    items: <DropdownMenuItem<String?>>[
                      const DropdownMenuItem<String?>(
                        value: null,
                        child: Text(
                          'Бүх сум / дүүрэг',
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      for (final DirectoryPlace s in soums)
                        DropdownMenuItem<String?>(
                          value: s.name,
                          child: Text(s.label, overflow: TextOverflow.ellipsis),
                        ),
                    ],
                    onChanged: soums.isEmpty
                        ? null
                        : (String? value) => setState(() => _soum = value),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
          ],
          TextField(
            controller: _query,
            textInputAction: TextInputAction.search,
            onSubmitted: (_) => _search(),
            decoration: _field(
              hint: 'Эмчийн нэр, мэргэжил, байгууллагаар хайх',
              prefix: const Icon(Icons.search_rounded),
              suffix: Padding(
                padding: const EdgeInsets.all(4),
                child: IconButton.filled(
                  onPressed: _search,
                  tooltip: 'Хайх',
                  icon: const Icon(Icons.arrow_forward_rounded, size: 20),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// "Шинэ тасалбар бичих…" — вебийн `PostComposer`-ийн хаалттай төлөв.
class _ComposerCard extends StatelessWidget {
  const _ComposerCard();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final me = context.watch<DoctorProfileController>().me;

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => Navigator.of(context).push<bool>(
          MaterialPageRoute<bool>(builder: (_) => const TicketComposerScreen()),
        ),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Row(
            children: <Widget>[
              CircleAvatar(
                radius: 20,
                backgroundColor: AppColors.primaryLight,
                child: Text(
                  me?.initials ?? '—',
                  style: theme.textTheme.titleSmall?.copyWith(
                    color: theme.colorScheme.primary,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Container(
                  height: 42,
                  alignment: Alignment.centerLeft,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceAlt,
                    borderRadius: BorderRadius.circular(999),
                    border: Border.all(color: theme.dividerColor),
                  ),
                  child: Text(
                    'Шинэ тасалбар бичих…',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.textTheme.bodySmall?.color,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 6),
              Icon(
                Icons.add_photo_alternate_outlined,
                color: theme.colorScheme.primary,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
