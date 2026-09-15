import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../chat/chat_controller.dart';
import '../notifications/notification_bell.dart';
import 'doctor_controllers.dart';
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
              const _ComposerCard(),
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
        const NotificationBell(isDoctor: true),
      ],
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
