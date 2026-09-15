import 'dart:async';

import 'package:flutter/material.dart';

import '../../shared/theme/app_colors.dart';
import '../../shared/theme/app_theme.dart';
import 'doctor_controllers.dart';
import 'doctor_models.dart';
import 'doctor_repository.dart';
import 'ticket_detail_screen.dart';

/// Асуумжийн урсгалын хэсгүүд — вебийн `customComponents/AdviceFeed/*`.
///
/// Нүүр хуудас ба асуумжийн дэлгэрэнгүй хоёулаа эндээс авдаг, тиймээс
/// "нээлттэй" гэж юу болохыг хоёр газар хоёр янзаар тодорхойлохгүй.

/// Вебийн `colors.status.normal` — хаагдсан асуумжийн зурвас.
const Color _closedGreen = Color(0xFF009C00);

/// Асуумжийн төлөвийн өнгө — вебийн `ticketStatus.statusAccent`.
///
/// ЗӨВХӨН ТЕКСТ БУС (зурвас). `urgent` нь ганц нөхцөлд: нээлттэй бөгөөд
/// хоногоос дээш хариугүй асуумж. Хаа сайгүй хэрэглэвэл анхааруулга
/// байхаа больж, чимэглэл болдог.
Color feedStatusAccent(FeedTicket t) {
  if (t.isOpen) {
    if (t.commentQty > 0) return AppColors.cyan;
    final created = t.createdAt;
    final stale = created != null &&
        DateTime.now().difference(created) > const Duration(hours: 24);
    return stale ? AppColors.urgent : AppColors.cyan;
  }
  if (t.isClosed) return _closedGreen;
  return AppColors.hairlineStrong;
}

void openTicket(
  BuildContext context,
  FeedTicket ticket, {
  bool focusReply = false,
}) {
  Navigator.of(context).push(
    MaterialPageRoute<void>(
      builder: (_) => TicketDetailScreen(ticket: ticket, focusReply: focusReply),
    ),
  );
}

/// Нүүр хуудасны урсгалын мөрүүд — `ListView`-ийн `children` дотор шууд.
List<Widget> buildFeedItems(BuildContext context, DoctorFeedController feed) {
  final theme = Theme.of(context);
  final state = feed.state;

  if (state.isIdle || state.isFirstLoad) {
    return const <Widget>[
      Padding(
        padding: EdgeInsets.symmetric(vertical: 32),
        child: Center(child: CircularProgressIndicator(strokeWidth: 2.4)),
      ),
    ];
  }

  if (state.hasError && !state.hasData) {
    return <Widget>[
      _FeedNotice(
        icon: Icons.cloud_off_rounded,
        title: 'Асуумжуудыг ачаалж чадсангүй',
        message: state.error?.message,
        actionLabel: 'Дахин оролдох',
        onAction: () => feed.load(refresh: true),
      ),
    ];
  }

  final items = feed.items;
  if (items.isEmpty) {
    // Шүүлтээр хоосон болсон нь "юу ч байхгүй"-гээс өөр нөхцөл.
    return <Widget>[
      _FeedNotice(
        icon: Icons.forum_outlined,
        title: feed.isFiltered
            ? 'Шүүлтэд тохирох асуумж олдсонгүй'
            : 'Асуумж байхгүй байна',
        actionLabel: feed.isFiltered ? 'Шүүлт цэвэрлэх' : null,
        onAction: feed.isFiltered
            ? () async {
                await feed.setSearch('');
                await feed.setFilter(FeedFilter.all);
              }
            : null,
      ),
    ];
  }

  return <Widget>[
    for (final FeedTicket t in items)
      Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: FeedTicketCard(
          ticket: t,
          onOpen: () => openTicket(context, t),
          onReply: () => openTicket(context, t, focusReply: true),
        ),
      ),
    if (feed.loadingMore)
      const Padding(
        padding: EdgeInsets.symmetric(vertical: 16),
        child: Center(
          child: SizedBox(
            width: 22,
            height: 22,
            child: CircularProgressIndicator(strokeWidth: 2.2),
          ),
        ),
      )
    else if (!feed.hasMore)
      Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Center(
          child: Text(
            'Бүх асуумжийг үзлээ',
            style: theme.textTheme.bodySmall,
          ),
        ),
      ),
  ];
}

class _FeedNotice extends StatelessWidget {
  const _FeedNotice({
    required this.icon,
    required this.title,
    this.message,
    this.actionLabel,
    this.onAction,
  });

  final IconData icon;
  final String title;
  final String? message;
  final String? actionLabel;
  final VoidCallback? onAction;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 28),
        child: Column(
          children: <Widget>[
            Icon(icon, size: 40, color: AppColors.hairlineStrong),
            const SizedBox(height: 10),
            Text(
              title,
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium,
            ),
            if ((message ?? '').isNotEmpty) ...<Widget>[
              const SizedBox(height: 4),
              Text(
                message!,
                textAlign: TextAlign.center,
                style: theme.textTheme.bodySmall,
              ),
            ],
            if (actionLabel != null && onAction != null) ...<Widget>[
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: onAction,
                style: OutlinedButton.styleFrom(minimumSize: const Size(0, 44)),
                child: Text(actionLabel!),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

/// Шүүлтүүрийн мөр — вебийн `FilterBar`: таб ба асуумжаар хайх.
class FeedFilterBar extends StatefulWidget {
  const FeedFilterBar({super.key, required this.controller});

  final DoctorFeedController controller;

  @override
  State<FeedFilterBar> createState() => _FeedFilterBarState();
}

class _FeedFilterBarState extends State<FeedFilterBar> {
  late final TextEditingController _query =
      TextEditingController(text: widget.controller.search);
  Timer? _debounce;

  @override
  void dispose() {
    _debounce?.cancel();
    _query.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    setState(() {}); // цэвэрлэх товч
    _debounce = Timer(
      const Duration(milliseconds: 400),
      () => widget.controller.setSearch(value),
    );
  }

  @override
  Widget build(BuildContext context) {
    final controller = widget.controller;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Row(
            children: <Widget>[
              for (final FeedFilter f in FeedFilter.values) ...<Widget>[
                ChoiceChip(
                  label: Text(f.label),
                  selected: controller.filter == f,
                  onSelected: (_) => controller.setFilter(f),
                ),
                const SizedBox(width: 8),
              ],
            ],
          ),
        ),
        const SizedBox(height: 10),
        TextField(
          controller: _query,
          onChanged: _onChanged,
          textInputAction: TextInputAction.search,
          decoration: InputDecoration(
            hintText: 'Асуумж хайх',
            isDense: true,
            prefixIcon: const Icon(Icons.search_rounded),
            suffixIcon: _query.text.isEmpty
                ? null
                : IconButton(
                    tooltip: 'Цэвэрлэх',
                    icon: const Icon(Icons.close_rounded),
                    onPressed: () {
                      _debounce?.cancel();
                      _query.clear();
                      setState(() {});
                      controller.setSearch('');
                    },
                  ),
          ),
        ),
      ],
    );
  }
}

/// Нэг асуумжийн карт — вебийн `FeedCard.jsx`.
///
/// [full] үед (дэлгэрэнгүй хуудас) агуулга бүтнээрээ, хариултын урьдчилсан
/// харагдац ба доод товчнуудгүй.
class FeedTicketCard extends StatelessWidget {
  const FeedTicketCard({
    super.key,
    required this.ticket,
    this.onOpen,
    this.onReply,
    this.full = false,
  });

  final FeedTicket ticket;
  final VoidCallback? onOpen;
  final VoidCallback? onReply;
  final bool full;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final t = ticket;
    final meta = <String>[t.date, t.place]
        .where((String s) => s.trim().isNotEmpty)
        .join('  ·  ');

    return Card(
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onOpen,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: <Widget>[
            Container(height: 3, color: feedStatusAccent(t)),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Row(
                    children: <Widget>[
                      FeedAvatar(file: t.avatar, name: t.authorName, radius: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Row(
                              children: <Widget>[
                                Flexible(
                                  child: Text(
                                    'Dr. ${t.authorName}',
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: theme.textTheme.titleSmall,
                                  ),
                                ),
                                if (t.statusLabel.isNotEmpty) ...<Widget>[
                                  const SizedBox(width: 6),
                                  _Pill(text: t.statusLabel, compact: true),
                                ],
                              ],
                            ),
                            const SizedBox(height: 2),
                            Text(
                              meta,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: theme.textTheme.bodySmall,
                            ),
                            if ((t.organizationName ?? '').isNotEmpty)
                              Text(
                                t.organizationName!,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: theme.textTheme.bodySmall,
                              ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  // Өвчтөний мэдээллийг агуулгаас салгаж — карт бичлэг биш,
                  // нийтлэл шиг уншигдах гол шалтгаан (вебийн тайлбараар).
                  if (t.patientLabel.isNotEmpty) ...<Widget>[
                    const SizedBox(height: 10),
                    _Pill(
                      text: t.patientLabel,
                      icon: Icons.person_outline_rounded,
                    ),
                  ],
                  if (t.hasBody) ...<Widget>[
                    const SizedBox(height: 10),
                    Text(
                      t.body.trim(),
                      maxLines: full ? null : 6,
                      overflow: full ? null : TextOverflow.ellipsis,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontSize: 15,
                        height: 1.5,
                      ),
                    ),
                  ] else if (t.comments.isEmpty && !full) ...<Widget>[
                    const SizedBox(height: 10),
                    Text(
                      'Тайлбар бичээгүй',
                      style: theme.textTheme.bodySmall?.copyWith(
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                  ],
                  if (t.files.isNotEmpty) ...<Widget>[
                    const SizedBox(height: 10),
                    FeedFiles(files: t.files, total: t.fileTotal),
                  ],
                  const SizedBox(height: 10),
                  Text(
                    '${t.commentQty} хариулт  ·  ${t.viewQty} үзсэн',
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ),
            ),
            if (!full && t.comments.isNotEmpty) ...<Widget>[
              const Divider(height: 1),
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 10, 14, 4),
                child: Column(
                  children: <Widget>[
                    for (final FeedComment c in t.comments.take(2))
                      Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: FeedCommentTile(comment: c, compact: true),
                      ),
                    if (t.commentQty > 2)
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 6),
                          child: Text(
                            'Бүх ${t.commentQty} хариултыг харах',
                            style: theme.textTheme.bodySmall?.copyWith(
                              color: AppColors.cyanInk,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
            if (!full) ...<Widget>[
              const Divider(height: 1),
              Row(
                children: <Widget>[
                  Expanded(
                    child: _CardAction(
                      icon: Icons.chat_bubble_outline_rounded,
                      label: 'Хариулах',
                      onTap: onReply,
                    ),
                  ),
                  const SizedBox(height: 28, child: VerticalDivider(width: 1)),
                  Expanded(
                    child: _CardAction(
                      icon: Icons.open_in_new_rounded,
                      label: 'Дэлгэрэнгүй',
                      onTap: onOpen,
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _CardAction extends StatelessWidget {
  const _CardAction({required this.icon, required this.label, this.onTap});

  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final muted = Theme.of(context).textTheme.bodySmall?.color;
    return TextButton.icon(
      onPressed: onTap,
      icon: Icon(icon, size: 18, color: muted),
      label: Text(label, style: TextStyle(color: muted)),
      style: TextButton.styleFrom(
        minimumSize: const Size.fromHeight(44),
        shape: const RoundedRectangleBorder(),
      ),
    );
  }
}

class _Pill extends StatelessWidget {
  const _Pill({required this.text, this.icon, this.compact = false});

  final String text;
  final IconData? icon;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: compact ? 8 : 10,
        vertical: compact ? 1 : 4,
      ),
      decoration: BoxDecoration(
        color: AppColors.primaryLight,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          if (icon != null) ...<Widget>[
            Icon(icon, size: 14, color: AppColors.cyanInk),
            const SizedBox(width: 4),
          ],
          Text(
            text,
            // Шошгын үг cyanInk — AA тэнцэх шат (`colors.js` § brand).
            style: theme.textTheme.bodySmall?.copyWith(
              color: AppColors.cyanInk,
              fontWeight: FontWeight.w700,
              fontSize: compact ? 11 : 12.5,
            ),
          ),
        ],
      ),
    );
  }
}

/// Зохиогчийн зураг, байхгүй бол нэрийн эхний үсэг.
class FeedAvatar extends StatelessWidget {
  const FeedAvatar({
    super.key,
    required this.file,
    required this.name,
    this.radius = 18,
  });

  final FeedFile? file;
  final String name;
  final double radius;

  @override
  Widget build(BuildContext context) {
    final bytes = file?.bytes;
    final initial = name.trim().isEmpty ? '?' : name.trim().characters.first;
    return CircleAvatar(
      radius: radius,
      backgroundColor: AppColors.primaryLight,
      backgroundImage: bytes == null ? null : MemoryImage(bytes),
      child: bytes == null
          ? Text(
              initial.toUpperCase(),
              style: TextStyle(
                color: AppColors.cyanInk,
                fontWeight: FontWeight.w700,
                fontSize: radius * 0.8,
              ),
            )
          : null,
    );
  }
}

/// Хавсралт: зургууд сүлжээгээр, бусад файл нэрээрээ.
///
/// Баримт бичгийг зургийн сүлжээнд оруулахгүй — саарал хавтан уншигчид юу ч
/// хэлэхгүй; нэртэй шошго хэлнэ (вебийн `mediaUtils.partitionFiles`).
class FeedFiles extends StatelessWidget {
  const FeedFiles({
    super.key,
    required this.files,
    required this.total,
    this.height = 220,
  });

  final List<FeedFile> files;
  final int total;
  final double height;

  @override
  Widget build(BuildContext context) {
    final photos = files.where((FeedFile f) => f.isImage).toList();
    final docs = files.where((FeedFile f) => !f.isImage).toList();
    final shown = photos.length > 4 ? 4 : photos.length;
    final hidden = (total - files.length).clamp(0, 999) + (photos.length - shown);

    Widget tile(int i, {int extra = 0}) => _PhotoTile(
          file: photos[i],
          extra: extra,
          onTap: () => showPhotoViewer(context, photos, i),
        );

    Widget? grid;
    if (shown == 1) {
      grid = SizedBox(height: height, child: tile(0, extra: hidden));
    } else if (shown == 2) {
      grid = SizedBox(
        height: height * 0.75,
        child: Row(
          children: <Widget>[
            Expanded(child: tile(0)),
            const SizedBox(width: 4),
            Expanded(child: tile(1, extra: hidden)),
          ],
        ),
      );
    } else if (shown >= 3) {
      grid = SizedBox(
        height: height,
        child: Row(
          children: <Widget>[
            Expanded(child: tile(0)),
            const SizedBox(width: 4),
            Expanded(
              child: Column(
                children: <Widget>[
                  Expanded(child: tile(1)),
                  const SizedBox(height: 4),
                  Expanded(
                    child: shown == 3
                        ? tile(2, extra: hidden)
                        : Row(
                            children: <Widget>[
                              Expanded(child: tile(2)),
                              const SizedBox(width: 4),
                              Expanded(child: tile(3, extra: hidden)),
                            ],
                          ),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        if (grid != null) grid,
        if (docs.isNotEmpty) ...<Widget>[
          if (grid != null) const SizedBox(height: 8),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: <Widget>[
              for (final FeedFile d in docs)
                Chip(
                  avatar: const Icon(Icons.insert_drive_file_outlined, size: 16),
                  label: Text(
                    d.ext.isEmpty ? d.name : '${d.name}.${d.ext}',
                    overflow: TextOverflow.ellipsis,
                  ),
                  visualDensity: VisualDensity.compact,
                ),
            ],
          ),
        ],
      ],
    );
  }
}

class _PhotoTile extends StatelessWidget {
  const _PhotoTile({required this.file, required this.onTap, this.extra = 0});

  final FeedFile file;
  final VoidCallback onTap;
  final int extra;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(AppTheme.cardRadius),
        child: Stack(
          fit: StackFit.expand,
          children: <Widget>[
            Image.memory(
              file.bytes!,
              fit: BoxFit.cover,
              gaplessPlayback: true,
              errorBuilder: (BuildContext context, Object error, StackTrace? s) =>
                  Container(
                color: AppColors.surfaceAlt,
                child: const Icon(Icons.broken_image_outlined),
              ),
            ),
            if (extra > 0)
              Container(
                color: Colors.black45,
                alignment: Alignment.center,
                child: Text(
                  '+$extra',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}

/// Зургийг бүтэн дэлгэцээр — хуруугаар томруулж, шударч харна.
Future<void> showPhotoViewer(
  BuildContext context,
  List<FeedFile> photos,
  int initial,
) {
  return showDialog<void>(
    context: context,
    barrierColor: Colors.black,
    builder: (BuildContext ctx) => Dialog.fullscreen(
      backgroundColor: Colors.black,
      child: Stack(
        children: <Widget>[
          PageView.builder(
            controller: PageController(initialPage: initial),
            itemCount: photos.length,
            itemBuilder: (BuildContext context, int i) => InteractiveViewer(
              maxScale: 5,
              child: Center(
                child: Image.memory(photos[i].bytes!, fit: BoxFit.contain),
              ),
            ),
          ),
          SafeArea(
            child: Align(
              alignment: Alignment.topRight,
              child: IconButton(
                tooltip: 'Хаах',
                onPressed: () => Navigator.of(ctx).pop(),
                icon: const Icon(Icons.close_rounded, color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    ),
  );
}

/// Нэг хариулт.
class FeedCommentTile extends StatelessWidget {
  const FeedCommentTile({
    super.key,
    required this.comment,
    this.compact = false,
  });

  final FeedComment comment;

  /// Картын урьдчилсан харагдац: текстийг 4 мөрөөр таслана.
  final bool compact;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final c = comment;
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        FeedAvatar(file: c.avatar, name: c.authorName, radius: 15),
        const SizedBox(width: 10),
        Expanded(
          child: Container(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 10),
            decoration: BoxDecoration(
              color: AppColors.surfaceAlt,
              borderRadius: BorderRadius.circular(AppTheme.cardRadius),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Expanded(
                      child: Text(
                        c.authorName.isEmpty ? 'Нэргүй' : 'Dr. ${c.authorName}',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.titleSmall?.copyWith(fontSize: 13.5),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(c.date, style: theme.textTheme.bodySmall?.copyWith(fontSize: 11.5)),
                  ],
                ),
                if (c.text.trim().isNotEmpty) ...<Widget>[
                  const SizedBox(height: 3),
                  Text(
                    c.text.trim(),
                    maxLines: compact ? 4 : null,
                    overflow: compact ? TextOverflow.ellipsis : null,
                    style: theme.textTheme.bodyMedium?.copyWith(height: 1.45),
                  ),
                ],
                if (c.files.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 8),
                  FeedFiles(
                    files: c.files,
                    total: c.fileTotal,
                    height: compact ? 120 : 180,
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }
}
