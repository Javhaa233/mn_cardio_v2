import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_client.dart';
import '../../core/util/json_read.dart';
import '../../core/util/mn_format.dart';
import '../../core/util/paged_controller.dart';
import '../../core/network/envelope.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/paged_list_view.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';

/// Миний мэдээлэлд хандсан нэг бичлэг.
class AccessLogEntry {
  const AccessLogEntry({
    required this.id,
    this.date,
    this.action,
    this.objectName,
    this.doctorName,
    this.organizationName,
  });

  final int id;
  final DateTime? date;
  final String? action;
  final String? objectName;
  final String? doctorName;
  final String? organizationName;

  /// Серверийн `Action` нь англи танигч — хэрэглэгчид монголоор харуулна.
  String get actionLabel => switch (action) {
        'ViewPatient' => 'Бүртгэлийг нээсэн',
        'ViewVisit' => 'Үзлэгийн бичлэг нээсэн',
        'ViewJournal' => 'Хэмжилтийн тэмдэглэл нээсэн',
        'ViewEvisit' => 'Цахим үзлэг нээсэн',
        'ViewRisk' => 'Эрсдэлийн үзүүлэлт нээсэн',
        'ViewRehab' => 'Сэргээн засахын мэдээлэл нээсэн',
        'Search' => 'Хайлтад олдсон',
        'Create' => 'Шинэ бичлэг үүсгэсэн',
        'Update' => 'Мэдээллийг зассан',
        _ => action == null || action!.isEmpty ? 'Мэдээлэлд хандсан' : action!,
      };

  factory AccessLogEntry.fromJson(Map<String, dynamic> json) => AccessLogEntry(
        id: J.intOf(json, <String>['Id']) ?? 0,
        date: J.date(json, <String>['LogDate']),
        action: J.str(json, <String>['Action']),
        objectName: J.str(json, <String>['ObjectName']),
        doctorName: J.str(json, <String>['DoctorName']),
        organizationName: J.str(json, <String>['OrganizationName']),
      );
}

/// Техникийн шаардлага §1.2 — "Үйлчлүүлэгчийн мэдээлэлд хандсан үед мэдэгдэл".
///
/// Мэдэгдэл илгээх бодлогыг (хандах бүрт үү, өдрийн нэгтгэл үү) ЗСҮТ шийдэх
/// хүртэл сервер зөвхөн бүртгэнэ. Энэ дэлгэц тэр бүртгэлийг харуулна.
class AccessLogController extends PagedController<AccessLogEntry> {
  AccessLogController(this._api);

  final ApiClient _api;

  @override
  Future<Paged<AccessLogEntry>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _api.getPaged<AccessLogEntry>(
      '/api/patient/access-log',
      AccessLogEntry.fromJson,
      limit: limit,
      offset: offset,
    );
  }
}

class AccessLogScreen extends StatefulWidget {
  const AccessLogScreen({super.key});

  @override
  State<AccessLogScreen> createState() => _AccessLogScreenState();
}

class _AccessLogScreenState extends State<AccessLogScreen> {
  late final AccessLogController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AccessLogController(context.read<ApiClient>());
    _controller.load();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Хандалтын түүх')),
      body: ListenableBuilder(
        listenable: _controller,
        builder: (BuildContext context, _) {
          // Сервер дээр энэ хэсэг асаагүй байж болно (503).
          if (_controller.state.error?.code == 'FEATURE_DISABLED') {
            return const PendingModuleNotice(
              title: 'Хандалтын түүх идэвхгүй байна',
              message: 'Энэ хэсэг серверт хараахан нээгдээгүй байна. '
                  'Нээгдсэн үед таны мэдээлэлд хэн, хэзээ хандсаныг '
                  'эндээс харах боломжтой болно.',
              icon: Icons.history_toggle_off_outlined,
            );
          }

          return PagedListView<AccessLogEntry>(
            controller: _controller,
            header: const _AccessLogIntro(),
            empty: const EmptyView(
              title: 'Хандалт бүртгэгдээгүй байна',
              message: 'Таны мэдээлэлд хандсан бичлэг одоогоор алга.',
              icon: Icons.verified_outlined,
            ),
            itemBuilder: (BuildContext context, AccessLogEntry item, _) =>
                _AccessTile(entry: item),
          );
        },
      ),
    );
  }
}

class _AccessLogIntro extends StatelessWidget {
  const _AccessLogIntro();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: SectionCard(
        title: 'Таны мэдээлэлд хэн хандсан бэ',
        icon: Icons.shield_outlined,
        child: Text(
          'Эмч таны эмнэлгийн мэдээллийг нээх бүрт бүртгэгддэг. Танихгүй '
          'байгууллага, танихгүй эмч байвал эмнэлгийн бүртгэлд хандаж '
          'тодруулна уу.',
          style: theme.textTheme.bodySmall?.copyWith(height: 1.5),
        ),
      ),
    );
  }
}

class _AccessTile extends StatelessWidget {
  const _AccessTile({required this.entry});

  final AccessLogEntry entry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SectionCard(
      padding: const EdgeInsets.all(14),
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
            child: const Icon(Icons.visibility_outlined,
                size: 20, color: AppColors.info),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  entry.doctorName?.trim().isNotEmpty == true
                      ? entry.doctorName!
                      : 'Эмнэлгийн ажилтан',
                  style: theme.textTheme.titleSmall,
                ),
                const SizedBox(height: 2),
                Text(entry.actionLabel, style: theme.textTheme.bodySmall),
                if (entry.organizationName?.trim().isNotEmpty == true) ...<Widget>[
                  const SizedBox(height: 2),
                  Text(
                    entry.organizationName!,
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(width: 8),
          Text(
            MnFormat.dateTime(entry.date),
            style: theme.textTheme.bodySmall?.copyWith(fontSize: 11),
          ),
        ],
      ),
    );
  }
}
