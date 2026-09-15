import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../core/util/validators.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/paged_list_view.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'evisit.dart';
import 'evisits_controller.dart';

/// 2.6 Цахим үзлэг — хүсэлт, цаг товлолт, үзлэг.
///
/// Урсгал: `Хүсэлт илгээсэн → Цаг товлосон → Үзлэг хийгдсэн`. Нээлттэй
/// хүсэлтийг цуцалж болно; дууссан, цуцлагдсан хүсэлт эргэж нээгдэхгүй тул
/// давтан зөвлөгөө бол шинэ хүсэлт (API.md §2.6).
class EvisitsScreen extends StatefulWidget {
  const EvisitsScreen({super.key});

  @override
  State<EvisitsScreen> createState() => _EvisitsScreenState();
}

class _EvisitsScreenState extends State<EvisitsScreen> {
  static const List<(String, String)> _filters = <(String, String)>[
    ('', 'Бүгд'),
    ('requested', 'Хүсэлт'),
    ('scheduled', 'Товлосон'),
    ('completed', 'Дууссан'),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<EvisitsController>();
      if (controller.state.isIdle) controller.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<EvisitsController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Цахим үзлэг')),
      floatingActionButton: FloatingActionButton.extended(
        heroTag: null,
        onPressed: _openForm,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Хүсэлт илгээх'),
      ),
      body: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: <Widget>[
                  for (final (String value, String label) in _filters) ...<Widget>[
                    ChoiceChip(
                      label: Text(label),
                      selected: controller.status == value,
                      onSelected: (_) => controller.setStatus(value),
                    ),
                    const SizedBox(width: 8),
                  ],
                ],
              ),
            ),
          ),
          Expanded(
            child: PagedListView<Evisit>(
              controller: controller,
              loadingLabel: 'Хүсэлтүүд уншиж байна…',
              itemBuilder: (BuildContext context, Evisit item, _) => _EvisitTile(
                evisit: item,
                onCancel: () => _cancel(item),
              ),
              empty: const EmptyView(
                title: 'Хүсэлт байхгүй байна',
                message: 'Эмнэлэгт очихгүйгээр эмчид хандах шаардлагатай бол '
                    'доорх товчоор хүсэлтээ илгээнэ үү.',
                icon: Icons.duo_outlined,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openForm() async {
    final controller = context.read<EvisitsController>();

    // Сервер нээлттэй 3 хүсэлтээс дээшийг татгалздаг. Хэрэглэгчийг бичүүлээд
    // сүүлд нь татгалзахын оронд урьдчилж хэлнэ.
    if (controller.openCount >= 3) {
      AppSnack.info(
        context,
        'Танд хариу хүлээж буй 3 хүсэлт байна. Эхлээд тэдгээрийг хүлээнэ үү.',
      );
      return;
    }

    final result = await showModalBottomSheet<_EvisitDraft>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _EvisitComposerSheet(),
    );
    if (result == null || result.comment.trim().isEmpty) return;

    final error = await controller.create(
      result.comment,
      requestedDate: result.requestedDate,
    );
    if (!mounted) return;
    if (error != null) {
      AppSnack.error(context, error.message);
    } else {
      AppSnack.success(context, 'Хүсэлт илгээгдлээ.');
    }
  }

  Future<void> _cancel(Evisit visit) async {
    final controller = context.read<EvisitsController>();
    final reason = await showDialog<String>(
      context: context,
      builder: (BuildContext ctx) => const _CancelDialog(),
    );
    if (reason == null) return;

    final error = await controller.cancel(visit, reason);
    if (!mounted) return;
    if (error != null) {
      AppSnack.error(context, error.message);
    } else {
      AppSnack.info(context, 'Хүсэлтийг цуцаллаа.');
    }
  }
}

class _EvisitTile extends StatelessWidget {
  const _EvisitTile({required this.evisit, required this.onCancel});

  final Evisit evisit;
  final VoidCallback onCancel;

  Color get _statusColor {
    if (evisit.isScheduled) return AppColors.success;
    if (evisit.isCompleted) return AppColors.info;
    if (evisit.isCancelled) return AppColors.inkDim;
    return AppColors.warning;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SectionCard(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Icon(
                Icons.duo_outlined,
                size: 17,
                color: theme.colorScheme.primary,
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: _statusColor.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  evisit.label,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: _statusColor,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                MnFormat.friendlyDate(evisit.createDate),
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(evisit.comment, style: theme.textTheme.bodyMedium),
          const SizedBox(height: 10),
          if (evisit.requestedDate != null)
            InfoRow(
              label: 'Хүссэн цаг',
              value: MnFormat.dateTime(evisit.requestedDate),
            ),
          if (evisit.scheduledDate != null)
            InfoRow(
              label: 'Товлосон цаг',
              value: MnFormat.dateTime(evisit.scheduledDate),
            ),
          if ((evisit.doctorName ?? '').trim().isNotEmpty)
            InfoRow(label: 'Эмч', value: evisit.doctorName!),
          if (evisit.canJoin) ...<Widget>[
            const SizedBox(height: 10),
            FilledButton.icon(
              onPressed: () async {
                await Clipboard.setData(
                  ClipboardData(text: evisit.meetingUrl!),
                );
                if (!context.mounted) return;
                AppSnack.success(
                  context,
                  'Холбоосыг хууллаа. Хөтчөөр нээнэ үү.',
                );
              },
              icon: const Icon(Icons.videocam_outlined, size: 18),
              label: const Text('Үзлэгийн холбоос'),
            ),
          ],
          if (evisit.isOpen) ...<Widget>[
            const SizedBox(height: 6),
            Align(
              alignment: Alignment.centerLeft,
              child: TextButton.icon(
                onPressed: onCancel,
                icon: const Icon(Icons.close_rounded, size: 18),
                label: const Text('Цуцлах'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

/// Маягтаас буцах утга — тайлбар ба хүссэн цаг.
class _EvisitDraft {
  const _EvisitDraft(this.comment, this.requestedDate);

  final String comment;
  final DateTime? requestedDate;
}

class _EvisitComposerSheet extends StatefulWidget {
  const _EvisitComposerSheet();

  @override
  State<_EvisitComposerSheet> createState() => _EvisitComposerSheetState();
}

class _EvisitComposerSheetState extends State<_EvisitComposerSheet> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _input = TextEditingController();
  DateTime? _requested;

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final day = await showDatePicker(
      context: context,
      firstDate: now,
      lastDate: now.add(const Duration(days: 90)),
      initialDate: _requested ?? now.add(const Duration(days: 1)),
    );
    if (day == null || !mounted) return;
    final time = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.fromDateTime(
        _requested ?? now.add(const Duration(hours: 1)),
      ),
    );
    if (!mounted) return;
    setState(() {
      _requested = DateTime(
        day.year,
        day.month,
        day.day,
        time?.hour ?? 9,
        time?.minute ?? 0,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.viewInsetsOf(context).bottom,
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text('Цахим үзлэгийн хүсэлт',
                    style: theme.textTheme.titleMedium),
                const SizedBox(height: 6),
                Text(
                  'Ямар шалтгаанаар хандаж байгаагаа, биеийн байдал болон '
                  'санаа зовоож буй зүйлээ дэлгэрэнгүй бичнэ үү.',
                  style: theme.textTheme.bodySmall,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _input,
                  autofocus: true,
                  minLines: 4,
                  maxLines: 8,
                  maxLength: 2000,
                  textCapitalization: TextCapitalization.sentences,
                  decoration: const InputDecoration(
                    hintText: 'Хүсэлтээ бичнэ үү…',
                  ),
                  validator: (String? v) => Validators.comment(v),
                ),
                const SizedBox(height: 4),
                // Хүссэн цаг заавал биш — эмнэлэг эцсийн цагийг товлоно.
                OutlinedButton.icon(
                  onPressed: _pickDate,
                  icon: const Icon(Icons.schedule_outlined, size: 18),
                  label: Text(
                    _requested == null
                        ? 'Хүсэх цаг сонгох (заавал биш)'
                        : MnFormat.dateTime(_requested),
                  ),
                ),
                if (_requested != null)
                  Align(
                    alignment: Alignment.centerLeft,
                    child: TextButton(
                      onPressed: () => setState(() => _requested = null),
                      child: const Text('Цагийг арилгах'),
                    ),
                  ),
                const SizedBox(height: 12),
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
                        onPressed: () {
                          if (_formKey.currentState?.validate() ?? false) {
                            Navigator.of(context).pop(
                              _EvisitDraft(_input.text, _requested),
                            );
                          }
                        },
                        child: const Text('Илгээх'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _CancelDialog extends StatefulWidget {
  const _CancelDialog();

  @override
  State<_CancelDialog> createState() => _CancelDialogState();
}

class _CancelDialogState extends State<_CancelDialog> {
  final TextEditingController _reason = TextEditingController();

  @override
  void dispose() {
    _reason.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Хүсэлт цуцлах'),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          const Text(
            'Цуцалсан хүсэлт эргэж нээгдэхгүй. Шаардлагатай бол шинэ хүсэлт '
            'илгээнэ үү.',
          ),
          const SizedBox(height: 12),
          TextField(
            controller: _reason,
            maxLength: 200,
            decoration: const InputDecoration(
              hintText: 'Шалтгаан (заавал биш)',
            ),
          ),
        ],
      ),
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Болих'),
        ),
        FilledButton(
          onPressed: () => Navigator.of(context).pop(_reason.text),
          child: const Text('Цуцлах'),
        ),
      ],
    );
  }
}
