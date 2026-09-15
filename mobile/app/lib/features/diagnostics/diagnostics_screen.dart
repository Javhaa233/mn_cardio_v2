import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import '../../core/util/mn_format.dart';
import '../../core/util/paged_controller.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/paged_list_view.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'diagnostics.dart';

/// Техникийн шаардлага §3.1 — "Шинжилгээ оношлогоо байна".
class DiagnosticsController extends PagedController<DiagnosticSummary> {
  DiagnosticsController(this._repo);

  final DiagnosticsRepository _repo;

  String _type = '';
  String get type => _type;

  @override
  Future<Paged<DiagnosticSummary>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _repo.fetchPage(limit: limit, offset: offset, type: _type);
  }

  Future<void> setType(String value) async {
    if (_type == value) return;
    _type = value;
    await reset();
  }
}

/// Үйлчлүүлэгч өөрийн, эмч үйлчлүүлэгчийн шинжилгээг нэг дэлгэцээр харна.
class DiagnosticsScreen extends StatefulWidget {
  const DiagnosticsScreen({super.key, this.patientId, this.patientName});

  /// `null` бол нэвтэрсэн үйлчлүүлэгчийн өөрийн шинжилгээ.
  final int? patientId;
  final String? patientName;

  @override
  State<DiagnosticsScreen> createState() => _DiagnosticsScreenState();
}

class _DiagnosticsScreenState extends State<DiagnosticsScreen> {
  static const List<(String, String)> _types = <(String, String)>[
    ('', 'Бүгд'),
    ('lab', 'Лаборатори'),
    ('echo', 'Эхо'),
    ('cathlab', 'Ангиографи'),
    ('ecg', 'ЗЦБ'),
  ];

  late final DiagnosticsRepository _repo;
  late final DiagnosticsController _controller;

  @override
  void initState() {
    super.initState();
    _repo = DiagnosticsRepository(
      context.read<ApiClient>(),
      patientId: widget.patientId,
    );
    _controller = DiagnosticsController(_repo)..load();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Шинжилгээ, оношлогоо'),
        bottom: widget.patientName == null
            ? null
            : PreferredSize(
                preferredSize: const Size.fromHeight(20),
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(
                    widget.patientName!,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ),
              ),
      ),
      body: ListenableBuilder(
        listenable: _controller,
        builder: (BuildContext context, _) => Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: <Widget>[
                    for (final (String value, String label) in _types) ...<Widget>[
                      ChoiceChip(
                        label: Text(label),
                        selected: _controller.type == value,
                        onSelected: (_) => _controller.setType(value),
                      ),
                      const SizedBox(width: 8),
                    ],
                  ],
                ),
              ),
            ),
            Expanded(
              child: PagedListView<DiagnosticSummary>(
                controller: _controller,
                loadingLabel: 'Шинжилгээ уншиж байна…',
                empty: const EmptyView(
                  title: 'Шинжилгээ байхгүй байна',
                  message: 'Бүртгэгдсэн шинжилгээ, оношлогооны хариу алга.',
                  icon: Icons.science_outlined,
                ),
                itemBuilder:
                    (BuildContext context, DiagnosticSummary item, _) =>
                        _DiagnosticTile(
                  item: item,
                  onTap: () => Navigator.of(context).push(
                    MaterialPageRoute<void>(
                      builder: (_) => DiagnosticDetailScreen(
                        repo: _repo,
                        summary: item,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DiagnosticTile extends StatelessWidget {
  const _DiagnosticTile({required this.item, required this.onTap});

  final DiagnosticSummary item;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SectionCard(
      padding: const EdgeInsets.all(14),
      onTap: onTap,
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: 38,
            height: 38,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppColors.info.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.science_outlined,
                size: 20, color: AppColors.info),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  item.title?.trim().isNotEmpty == true
                      ? item.title!
                      : item.typeLabel,
                  style: theme.textTheme.titleSmall,
                ),
                const SizedBox(height: 2),
                Text(
                  '${item.typeLabel} · ${MnFormat.date(item.date)}',
                  style: theme.textTheme.bodySmall,
                ),
                if (item.summary?.trim().isNotEmpty == true) ...<Widget>[
                  const SizedBox(height: 4),
                  Text(
                    item.summary!,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, size: 20),
        ],
      ),
    );
  }
}

class DiagnosticDetailScreen extends StatefulWidget {
  const DiagnosticDetailScreen({
    super.key,
    required this.repo,
    required this.summary,
  });

  final DiagnosticsRepository repo;
  final DiagnosticSummary summary;

  @override
  State<DiagnosticDetailScreen> createState() => _DiagnosticDetailScreenState();
}

class _DiagnosticDetailScreenState extends State<DiagnosticDetailScreen> {
  DiagnosticDetail? _detail;
  ApiException? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final detail = await widget.repo.fetchDetail(
        widget.summary.type,
        widget.summary.id,
      );
      if (!mounted) return;
      setState(() {
        _detail = detail;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final detail = _detail;

    return Scaffold(
      appBar: AppBar(title: Text(widget.summary.typeLabel)),
      body: Builder(
        builder: (BuildContext context) {
          if (_loading) return const LoadingView();
          if (_error != null) {
            return ErrorView(error: _error!, onRetry: _load);
          }
          if (detail == null) {
            return const EmptyView(
              title: 'Мэдээлэл олдсонгүй',
              icon: Icons.science_outlined,
            );
          }

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
            children: <Widget>[
              SectionCard(
                title: 'Товч мэдээлэл',
                icon: Icons.info_outline_rounded,
                child: Column(
                  children: <Widget>[
                    InfoRow(label: 'Огноо', value: MnFormat.date(detail.date)),
                    if ((detail.organization ?? '').isNotEmpty)
                      InfoRow(
                        label: 'Байгууллага',
                        value: detail.organization!,
                      ),
                    if ((detail.diagnosis ?? '').isNotEmpty)
                      InfoRow(label: 'Онош', value: detail.diagnosis!),
                    if ((detail.complaint ?? '').isNotEmpty)
                      InfoRow(label: 'Гомдол', value: detail.complaint!),
                    if ((detail.regularMedication ?? '').isNotEmpty)
                      InfoRow(
                        label: 'Хэрэглэдэг эм',
                        value: detail.regularMedication!,
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              if (detail.panels.isEmpty && detail.type != 'lab')
                Padding(
                  padding: const EdgeInsets.only(top: 4),
                  child: Text(
                    'Энэ төрлийн шинжилгээний бүрэн бичлэгийг МнКардио вэб '
                    'хувилбараас харна уу.',
                    style: theme.textTheme.bodySmall,
                  ),
                ),
              for (final panel in detail.panels) ...<Widget>[
                _PanelCard(panel: panel),
                const SizedBox(height: 12),
              ],
              if (detail.panels.any((LabPanel p) => p.results.any(
                  (LabResult r) => r.refRange == null || r.unit == null)))
                Text(
                  'Зарим үзүүлэлтийн нэгж, лавлах хэмжээ системд бүртгэгдээгүй '
                  'байна. Лавлах хэмжээгүй үр дүнг "хэвийн" гэж үзэж болохгүй.',
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: AppColors.warning,
                    height: 1.5,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _PanelCard extends StatelessWidget {
  const _PanelCard({required this.panel});

  final LabPanel panel;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SectionCard(
      title: panel.label,
      subtitle: panel.date == null ? null : MnFormat.date(panel.date),
      icon: panel.confidential ? Icons.lock_outline_rounded : Icons.biotech_outlined,
      child: panel.restricted
          ? Text(
              // Нууцалсан ч бүлгийг нуухгүй: "шинжилгээ хийгдээгүй" гэж
              // эмчийг андуурахаас сэргийлнэ.
              'Энэ бүлгийн хариуг харах эрх танд байхгүй байна. '
              'Шинжилгээ хийгдсэн боловч агуулга нь нууцлагдсан.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppColors.warning,
                height: 1.5,
              ),
            )
          : Column(
              children: <Widget>[
                for (final result in panel.results)
                  InfoRow(
                    label: result.label,
                    value: <String>[
                      result.value ?? '',
                      if ((result.unit ?? '').isNotEmpty) result.unit!,
                    ].where((String s) => s.isNotEmpty).join(' '),
                  ),
              ],
            ),
    );
  }
}
