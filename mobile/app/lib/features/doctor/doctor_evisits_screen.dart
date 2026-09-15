import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import '../../core/util/mn_format.dart';
import '../../core/util/paged_controller.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/paged_list_view.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'doctor_models.dart';
import 'doctor_repository.dart';

/// Эмчийн цахим үзлэгийн дараалал — API.md §2.6b.
///
/// Эрэмбэ нь **хамгийн эртний хүсэлт эхэнд**: энэ бол жагсаалт биш, ээлж.
class DoctorEvisitsController extends PagedController<DoctorEvisit> {
  DoctorEvisitsController(this._repo);

  final DoctorRepository _repo;

  String _scope = 'mine';
  bool _busy = false;

  String get scope => _scope;
  bool get busy => _busy;

  @override
  Future<Paged<DoctorEvisit>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _repo.fetchEvisits(limit: limit, offset: offset, scope: _scope);
  }

  Future<void> setScope(String value) async {
    if (_scope == value) return;
    _scope = value;
    await reset();
  }

  Future<ApiException?> schedule(
    DoctorEvisit visit, {
    required DateTime date,
    String meetingUrl = '',
  }) =>
      _act(() => _repo.scheduleEvisit(
            visit.id,
            scheduledDate: date,
            meetingUrl: meetingUrl,
          ));

  Future<ApiException?> complete(DoctorEvisit visit, {String comment = ''}) =>
      _act(() => _repo.completeEvisit(visit.id, comment: comment));

  Future<ApiException?> cancel(DoctorEvisit visit, {String reason = ''}) =>
      _act(() => _repo.cancelEvisit(visit.id, reason: reason));

  Future<ApiException?> _act(Future<void> Function() action) async {
    if (_busy) return null;
    _busy = true;
    notifyListeners();
    try {
      await action();
      await load(refresh: true);
      return null;
    } on ApiException catch (e) {
      return e;
    } finally {
      _busy = false;
      notifyListeners();
    }
  }
}

class DoctorEvisitsScreen extends StatefulWidget {
  const DoctorEvisitsScreen({super.key});

  @override
  State<DoctorEvisitsScreen> createState() => _DoctorEvisitsScreenState();
}

class _DoctorEvisitsScreenState extends State<DoctorEvisitsScreen> {
  late final DoctorEvisitsController _controller;

  @override
  void initState() {
    super.initState();
    _controller = DoctorEvisitsController(context.read<DoctorRepository>());
    _controller.load();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _schedule(DoctorEvisit visit) async {
    final result = await showModalBottomSheet<_ScheduleDraft>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _ScheduleSheet(visit: visit),
    );
    if (result == null) return;
    final error = await _controller.schedule(
      visit,
      date: result.date,
      meetingUrl: result.meetingUrl,
    );
    if (!mounted) return;
    if (error != null) {
      AppSnack.error(context, error.message);
    } else {
      AppSnack.success(context, 'Цаг товлолоо.');
    }
  }

  Future<void> _complete(DoctorEvisit visit) async {
    final comment = await _askText(
      title: 'Үзлэг дуусгах',
      hint: 'Тэмдэглэл (заавал биш)',
      action: 'Дуусгах',
    );
    if (comment == null) return;
    final error = await _controller.complete(visit, comment: comment);
    if (!mounted) return;
    if (error != null) {
      AppSnack.error(context, error.message);
    } else {
      AppSnack.success(context, 'Үзлэгийг дууссан гэж тэмдэглэлээ.');
    }
  }

  Future<void> _cancel(DoctorEvisit visit) async {
    final reason = await _askText(
      title: 'Хүсэлт цуцлах',
      hint: 'Шалтгаан (үйлчлүүлэгчид харагдана)',
      action: 'Цуцлах',
    );
    if (reason == null) return;
    final error = await _controller.cancel(visit, reason: reason);
    if (!mounted) return;
    if (error != null) {
      AppSnack.error(context, error.message);
    } else {
      AppSnack.info(context, 'Хүсэлтийг цуцаллаа.');
    }
  }

  Future<String?> _askText({
    required String title,
    required String hint,
    required String action,
  }) {
    final input = TextEditingController();
    return showDialog<String>(
      context: context,
      builder: (BuildContext ctx) => AlertDialog(
        title: Text(title),
        content: TextField(
          controller: input,
          maxLength: 500,
          maxLines: 3,
          decoration: InputDecoration(hintText: hint),
        ),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Болих'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(input.text),
            child: Text(action),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Цахим үзлэг')),
      body: ListenableBuilder(
        listenable: _controller,
        builder: (BuildContext context, _) => Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
              child: Row(
                children: <Widget>[
                  ChoiceChip(
                    label: const Text('Надад хуваарилсан'),
                    selected: _controller.scope == 'mine',
                    onSelected: (_) => _controller.setScope('mine'),
                  ),
                  const SizedBox(width: 8),
                  ChoiceChip(
                    label: const Text('Эзэнгүй'),
                    selected: _controller.scope == 'unassigned',
                    onSelected: (_) => _controller.setScope('unassigned'),
                  ),
                ],
              ),
            ),
            Expanded(
              child: PagedListView<DoctorEvisit>(
                controller: _controller,
                loadingLabel: 'Хүсэлтүүд уншиж байна…',
                empty: EmptyView(
                  title: 'Хүсэлт байхгүй байна',
                  message: _controller.scope == 'mine'
                      ? 'Танд хуваарилагдсан цахим үзлэгийн хүсэлт алга.'
                      : 'Таны үйлчлүүлэгчдийн эзэнгүй хүсэлт алга.',
                  icon: Icons.duo_outlined,
                ),
                itemBuilder: (BuildContext context, DoctorEvisit item, _) =>
                    _DoctorEvisitTile(
                  visit: item,
                  busy: _controller.busy,
                  onSchedule: () => _schedule(item),
                  onComplete: () => _complete(item),
                  onCancel: () => _cancel(item),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DoctorEvisitTile extends StatelessWidget {
  const _DoctorEvisitTile({
    required this.visit,
    required this.busy,
    required this.onSchedule,
    required this.onComplete,
    required this.onCancel,
  });

  final DoctorEvisit visit;
  final bool busy;
  final VoidCallback onSchedule;
  final VoidCallback onComplete;
  final VoidCallback onCancel;

  Color get _statusColor {
    if (visit.isScheduled) return AppColors.success;
    if (visit.isRequested) return AppColors.warning;
    return AppColors.info;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SectionCard(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Expanded(
                child: Text(
                  visit.patientName ?? 'Үйлчлүүлэгч',
                  style: theme.textTheme.titleSmall,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: _statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  visit.label,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: _statusColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          if ((visit.patientRegistration ?? '').isNotEmpty)
            Text(visit.patientRegistration!, style: theme.textTheme.bodySmall),
          const SizedBox(height: 8),
          Text(visit.comment, style: theme.textTheme.bodyMedium),
          const SizedBox(height: 8),
          if (visit.requestedDate != null)
            InfoRow(
              label: 'Хүссэн цаг',
              value: MnFormat.dateTime(visit.requestedDate),
            ),
          if (visit.scheduledDate != null)
            InfoRow(
              label: 'Товлосон цаг',
              value: MnFormat.dateTime(visit.scheduledDate),
            ),
          InfoRow(
            label: 'Илгээсэн',
            value: MnFormat.dateTime(visit.createDate),
          ),
          if ((visit.meetingUrl ?? '').isNotEmpty)
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: () async {
                  await Clipboard.setData(
                    ClipboardData(text: visit.meetingUrl!),
                  );
                  if (!context.mounted) return;
                  AppSnack.success(context, 'Холбоосыг хууллаа.');
                },
                icon: const Icon(Icons.link_rounded, size: 18),
                label: const Text('Үзлэгийн холбоос'),
              ),
            ),
          if (visit.isOpen) ...<Widget>[
            const Divider(height: 18),
            Wrap(
              spacing: 8,
              children: <Widget>[
                if (visit.isRequested)
                  FilledButton.icon(
                    onPressed: busy ? null : onSchedule,
                    icon: const Icon(Icons.event_available_outlined, size: 18),
                    label: const Text('Цаг товлох'),
                  ),
                if (visit.isScheduled)
                  FilledButton.icon(
                    onPressed: busy ? null : onComplete,
                    icon: const Icon(Icons.task_alt_outlined, size: 18),
                    label: const Text('Дуусгах'),
                  ),
                OutlinedButton.icon(
                  onPressed: busy ? null : onCancel,
                  icon: const Icon(Icons.close_rounded, size: 18),
                  label: const Text('Цуцлах'),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}

class _ScheduleDraft {
  const _ScheduleDraft(this.date, this.meetingUrl);

  final DateTime date;
  final String meetingUrl;
}

class _ScheduleSheet extends StatefulWidget {
  const _ScheduleSheet({required this.visit});

  final DoctorEvisit visit;

  @override
  State<_ScheduleSheet> createState() => _ScheduleSheetState();
}

class _ScheduleSheetState extends State<_ScheduleSheet> {
  final TextEditingController _url = TextEditingController();
  late DateTime _date;
  String? _urlError;

  @override
  void initState() {
    super.initState();
    // Үйлчлүүлэгчийн хүссэн цагийг эхлэлээр авна — ихэнхдээ түүнийг баталдаг.
    final requested = widget.visit.requestedDate;
    final now = DateTime.now();
    _date = (requested != null && requested.isAfter(now))
        ? requested
        : now.add(const Duration(days: 1));
  }

  @override
  void dispose() {
    _url.dispose();
    super.dispose();
  }

  Future<void> _pick() async {
    final now = DateTime.now();
    final day = await showDatePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 180)),
      initialDate: _date.isBefore(now) ? now : _date,
    );
    if (day == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(_date),
    );
    if (!mounted) return;
    setState(() {
      _date = DateTime(
        day.year,
        day.month,
        day.day,
        time?.hour ?? _date.hour,
        time?.minute ?? _date.minute,
      );
    });
  }

  void _submit() {
    final url = _url.text.trim();
    // Сервер `https://` биш холбоосыг татгалздаг — эмчийг хүлээлгэхгүй.
    if (url.isNotEmpty && !url.startsWith('https://')) {
      setState(() => _urlError = 'Холбоос https:// -ээр эхлэх ёстой.');
      return;
    }
    Navigator.of(context).pop(_ScheduleDraft(_date, url));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text('Цаг товлох', style: theme.textTheme.titleMedium),
              const SizedBox(height: 6),
              Text(
                widget.visit.patientName ?? 'Үйлчлүүлэгч',
                style: theme.textTheme.bodySmall,
              ),
              const SizedBox(height: 16),
              OutlinedButton.icon(
                onPressed: _pick,
                icon: const Icon(Icons.schedule_outlined, size: 18),
                label: Text(MnFormat.dateTime(_date)),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _url,
                keyboardType: TextInputType.url,
                decoration: InputDecoration(
                  labelText: 'Видео дуудлагын холбоос (заавал биш)',
                  hintText: 'https://…',
                  errorText: _urlError,
                ),
                onChanged: (_) {
                  if (_urlError != null) setState(() => _urlError = null);
                },
              ),
              const SizedBox(height: 16),
              Row(
                children: <Widget>[
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Navigator.of(context).pop(),
                      child: const Text('Болих'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton(
                      onPressed: _submit,
                      child: const Text('Товлох'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
