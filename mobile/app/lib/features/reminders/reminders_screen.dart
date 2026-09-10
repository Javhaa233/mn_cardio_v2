import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/notifications/reminder.dart';
import '../../core/notifications/reminder_controller.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';

/// Техникийн шаардлага §37 — хэрэглэгчийн тохируулах сануулга.
class RemindersScreen extends StatefulWidget {
  const RemindersScreen({super.key});

  @override
  State<RemindersScreen> createState() => _RemindersScreenState();
}

class _RemindersScreenState extends State<RemindersScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ReminderController>().load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<ReminderController>();
    final reminders = controller.reminders;

    return Scaffold(
      appBar: AppBar(title: const Text('Сануулга')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _edit(null),
        icon: const Icon(Icons.add_alarm_rounded),
        label: const Text('Сануулга нэмэх'),
      ),
      body: reminders.isEmpty
          ? ListView(
              children: <Widget>[
                const Padding(
                  padding: EdgeInsets.fromLTRB(16, 16, 16, 0),
                  child: _PushNotice(),
                ),
                SizedBox(
                  height: MediaQuery.sizeOf(context).height * 0.5,
                  child: EmptyView(
                    title: 'Сануулга тохируулаагүй байна',
                    message: 'Эм уух, дасгал хийх, хяналтын үзлэгийн цагаа '
                        'сануулахаар тохируулж болно.',
                    icon: Icons.notifications_none_rounded,
                    actionLabel: 'Сануулга нэмэх',
                    onAction: () => _edit(null),
                  ),
                ),
              ],
            )
          : ListView(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 90),
              children: <Widget>[
                const _PushNotice(),
                const SizedBox(height: 14),
                for (final reminder in reminders)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _ReminderTile(
                      reminder: reminder,
                      onToggle: (bool value) =>
                          controller.toggle(reminder, value),
                      onTap: () => _edit(reminder),
                      onDelete: () => _delete(reminder),
                    ),
                  ),
              ],
            ),
    );
  }

  Future<void> _edit(Reminder? existing) async {
    final controller = context.read<ReminderController>();

    // Мэдэгдэл харуулах зөвшөөрлийг сануулга үүсгэх мөчид асууна — яагаад
    // асууж байгаа нь хэрэглэгчид тодорхой байх ёстой.
    if (!controller.permissionGranted) {
      final granted = await controller.requestPermission();
      if (!mounted) return;
      if (!granted) {
        AppSnack.error(
          context,
          'Мэдэгдэл харуулах зөвшөөрөл өгөөгүй тул сануулга ажиллахгүй. '
          'Төхөөрөмжийн тохиргооноос зөвшөөрнө үү.',
        );
        return;
      }
    }

    if (!mounted) return;
    final result = await showModalBottomSheet<Reminder>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (_) => _ReminderFormSheet(existing: existing),
    );
    if (result == null || !mounted) return;

    if (existing == null) {
      await controller.add(result);
    } else {
      await controller.update(result);
    }
    if (mounted) AppSnack.success(context, 'Сануулга хадгалагдлаа.');
  }

  Future<void> _delete(Reminder reminder) async {
    final confirmed = await confirmDialog(
      context,
      title: 'Сануулга устгах',
      message: '"${reminder.displayTitle}" сануулгыг устгах уу?',
      confirmLabel: 'Устгах',
      destructive: true,
    );
    if (!confirmed || !mounted) return;
    await context.read<ReminderController>().remove(reminder);
    if (mounted) AppSnack.info(context, 'Сануулга устгагдлаа.');
  }
}

/// Push мэдэгдэл байхгүйг илэн далангүй хэлнэ.
class _PushNotice extends StatelessWidget {
  const _PushNotice();

  @override
  Widget build(BuildContext context) {
    return const PendingModuleNotice(
      title: 'Сануулга хэрхэн ажилладаг вэ',
      message: 'Эдгээр сануулгыг таны утас өөрөө хүргэдэг тул апп хаалттай '
          'үед ч ажиллана. Харин эмчээс ирсэн шинэ мессеж, зөвлөгөөний '
          'мэдэгдлийг хүргэх боломж эмнэлгийн систем дээр хараахан '
          'бэлэн болоогүй байна.',
      icon: Icons.notifications_active_outlined,
    );
  }
}

class _ReminderTile extends StatelessWidget {
  const _ReminderTile({
    required this.reminder,
    required this.onToggle,
    required this.onTap,
    required this.onDelete,
  });

  final Reminder reminder;
  final ValueChanged<bool> onToggle;
  final VoidCallback onTap;
  final VoidCallback onDelete;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SectionCard(
      onTap: onTap,
      padding: const EdgeInsets.fromLTRB(14, 12, 8, 12),
      child: Row(
        children: <Widget>[
          Container(
            width: 44,
            height: 44,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              reminder.type.icon,
              size: 21,
              color: theme.colorScheme.primary,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Text(
                      reminder.timeLabel,
                      style: theme.textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(width: 10),
                    Flexible(
                      child: Text(
                        reminder.displayTitle,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: theme.textTheme.bodyMedium,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  reminder.weekdayLabel,
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          Switch(value: reminder.enabled, onChanged: onToggle),
          IconButton(
            onPressed: onDelete,
            tooltip: 'Устгах',
            visualDensity: VisualDensity.compact,
            icon: const Icon(Icons.delete_outline_rounded, size: 20),
          ),
        ],
      ),
    );
  }
}

class _ReminderFormSheet extends StatefulWidget {
  const _ReminderFormSheet({this.existing});

  final Reminder? existing;

  @override
  State<_ReminderFormSheet> createState() => _ReminderFormSheetState();
}

class _ReminderFormSheetState extends State<_ReminderFormSheet> {
  late ReminderType _type;
  late TimeOfDay _time;
  late Set<int> _weekdays;
  late final TextEditingController _title;
  late final TextEditingController _note;

  @override
  void initState() {
    super.initState();
    final existing = widget.existing;
    _type = existing?.type ?? ReminderType.medication;
    _time = existing?.timeOfDay ?? const TimeOfDay(hour: 8, minute: 0);
    _weekdays = <int>{...?existing?.weekdays};
    if (_weekdays.isEmpty) _weekdays = <int>{1, 2, 3, 4, 5, 6, 7};
    _title = TextEditingController(text: existing?.title ?? '');
    _note = TextEditingController(text: existing?.note ?? '');
  }

  @override
  void dispose() {
    _title.dispose();
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: DraggableScrollableSheet(
        initialChildSize: 0.85,
        minChildSize: 0.5,
        maxChildSize: 0.95,
        expand: false,
        builder: (BuildContext context, ScrollController scroll) {
          return ListView(
            controller: scroll,
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 28),
            children: <Widget>[
              Text(
                widget.existing == null ? 'Шинэ сануулга' : 'Сануулга засах',
                style: theme.textTheme.titleMedium,
              ),
              const SizedBox(height: 18),
              Text('Төрөл', style: theme.textTheme.titleSmall),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: <Widget>[
                  for (final type in ReminderType.values)
                    ChoiceChip(
                      avatar: Icon(type.icon, size: 17),
                      label: Text(type.label),
                      selected: _type == type,
                      onSelected: (_) => setState(() => _type = type),
                    ),
                ],
              ),
              const SizedBox(height: 20),
              InkWell(
                onTap: _pickTime,
                borderRadius: BorderRadius.circular(12),
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 16,
                  ),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.surfaceContainerHighest
                        .withValues(alpha: 0.5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: theme.dividerColor),
                  ),
                  child: Row(
                    children: <Widget>[
                      Icon(
                        Icons.schedule_outlined,
                        size: 20,
                        color: theme.colorScheme.primary,
                      ),
                      const SizedBox(width: 12),
                      Text('Цаг', style: theme.textTheme.bodyMedium),
                      const Spacer(),
                      Text(
                        '${_time.hour.toString().padLeft(2, '0')}:'
                        '${_time.minute.toString().padLeft(2, '0')}',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const Icon(Icons.chevron_right_rounded, size: 20),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text('Давтамж', style: theme.textTheme.titleSmall),
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                children: <Widget>[
                  for (final entry in const <(int, String)>[
                    (1, 'Да'),
                    (2, 'Мя'),
                    (3, 'Лх'),
                    (4, 'Пү'),
                    (5, 'Ба'),
                    (6, 'Бя'),
                    (7, 'Ня'),
                  ])
                    FilterChip(
                      label: Text(entry.$2),
                      selected: _weekdays.contains(entry.$1),
                      onSelected: (bool selected) => setState(() {
                        if (selected) {
                          _weekdays.add(entry.$1);
                        } else if (_weekdays.length > 1) {
                          _weekdays.remove(entry.$1);
                        }
                      }),
                    ),
                ],
              ),
              const SizedBox(height: 20),
              TextField(
                controller: _title,
                maxLength: 60,
                textCapitalization: TextCapitalization.sentences,
                decoration: InputDecoration(
                  labelText: 'Гарчиг (заавал биш)',
                  hintText: _type.label,
                  counterText: '',
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _note,
                minLines: 2,
                maxLines: 3,
                maxLength: 160,
                textCapitalization: TextCapitalization.sentences,
                decoration: InputDecoration(
                  labelText: 'Тайлбар (заавал биш)',
                  hintText: _type.defaultBody,
                  counterText: '',
                ),
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
                      child: const Text('Хадгалах'),
                    ),
                  ),
                ],
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _time,
      helpText: 'Сануулах цаг',
      cancelText: 'Болих',
      confirmText: 'Сонгох',
      builder: (BuildContext context, Widget? child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _time = picked);
  }

  void _submit() {
    Navigator.of(context).pop(
      Reminder(
        id: widget.existing?.id ?? 0,
        type: _type,
        hour: _time.hour,
        minute: _time.minute,
        title: _title.text.trim().isEmpty ? null : _title.text.trim(),
        note: _note.text.trim().isEmpty ? null : _note.text.trim(),
        weekdays: _weekdays,
        enabled: widget.existing?.enabled ?? true,
      ),
    );
  }
}
