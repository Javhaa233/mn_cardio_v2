import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../core/util/validators.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/section_card.dart';
import 'journal_controller.dart';
import 'journal_entry.dart';

/// Шинэ тэмдэглэл нэмэх.
///
/// Талбарууд нь backend-ийн хүлээж авдаг талбартай яг тохирно
/// (`date`, `time`, `blood_pressure`, `pulse`, `weight`, `inr`, `comment`).
/// Доод даралтын онцгой тохиолдлыг [JournalEntry.diastolic] дээр тайлбарласан.
class JournalFormScreen extends StatefulWidget {
  const JournalFormScreen({super.key});

  @override
  State<JournalFormScreen> createState() => _JournalFormScreenState();
}

class _JournalFormScreenState extends State<JournalFormScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final TextEditingController _systolic = TextEditingController();
  final TextEditingController _diastolic = TextEditingController();
  final TextEditingController _pulse = TextEditingController();
  final TextEditingController _weight = TextEditingController();
  final TextEditingController _inr = TextEditingController();
  final TextEditingController _comment = TextEditingController();

  DateTime _date = DateTime.now();
  TimeOfDay? _time = TimeOfDay.now();
  bool _saving = false;

  @override
  void dispose() {
    _systolic.dispose();
    _diastolic.dispose();
    _pulse.dispose();
    _weight.dispose();
    _inr.dispose();
    _comment.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Шинэ тэмдэглэл')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
          children: <Widget>[
            SectionCard(
              title: 'Хэзээ',
              icon: Icons.event_outlined,
              child: Column(
                children: <Widget>[
                  _PickerTile(
                    label: 'Огноо',
                    value: MnFormat.date(_date),
                    icon: Icons.calendar_today_outlined,
                    onTap: _pickDate,
                  ),
                  const Divider(height: 18),
                  _PickerTile(
                    label: 'Цаг',
                    value: _time == null
                        ? 'Сонгоогүй'
                        : _time!.format(context),
                    icon: Icons.schedule_outlined,
                    onTap: _pickTime,
                    onClear: _time == null
                        ? null
                        : () => setState(() => _time = null),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            SectionCard(
              title: 'Цусны даралт',
              subtitle: 'мм.МУБ',
              icon: Icons.monitor_heart_outlined,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Expanded(
                    child: _NumberField(
                      controller: _systolic,
                      label: 'Дээд (систол)',
                      hint: '120',
                      validator: (String? v) => Validators.systolic(v),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _NumberField(
                      controller: _diastolic,
                      label: 'Доод (диастол)',
                      hint: '80',
                      validator: (String? v) => Validators.diastolic(v),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            SectionCard(
              title: 'Бусад хэмжилт',
              icon: Icons.straighten_outlined,
              child: Column(
                children: <Widget>[
                  _NumberField(
                    controller: _pulse,
                    label: 'Судасны цохилт (уд/мин)',
                    hint: '72',
                    validator: (String? v) => Validators.pulse(v),
                  ),
                  const SizedBox(height: 12),
                  _NumberField(
                    controller: _weight,
                    label: 'Жин (кг)',
                    hint: '70',
                    allowDecimal: true,
                    validator: (String? v) => Validators.weight(v),
                  ),
                  const SizedBox(height: 12),
                  _NumberField(
                    controller: _inr,
                    label: 'INR',
                    hint: '2.5',
                    allowDecimal: true,
                    validator: (String? v) => Validators.inr(v),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            SectionCard(
              title: 'Тайлбар',
              icon: Icons.notes_outlined,
              child: TextFormField(
                controller: _comment,
                minLines: 3,
                maxLines: 6,
                maxLength: 1000,
                textCapitalization: TextCapitalization.sentences,
                decoration: const InputDecoration(
                  hintText:
                      'Биеийн байдал, хэрэглэсэн эм, шинж тэмдэг зэргийг бичиж болно.',
                  counterText: '',
                ),
                validator: (String? v) =>
                    Validators.comment(v, max: 1000, isRequired: false),
              ),
            ),
            const SizedBox(height: 20),
            FilledButton.icon(
              onPressed: _saving ? null : _save,
              icon: _saving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.2,
                        color: Colors.white,
                      ),
                    )
                  : const Icon(Icons.check_rounded),
              label: Text(_saving ? 'Хадгалж байна…' : 'Хадгалах'),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(now.year - 5),
      // Ирээдүйн огноогоор хэмжилт бүртгэх нь утгагүй.
      lastDate: DateTime(now.year, now.month, now.day),
      helpText: 'Огноо сонгох',
      cancelText: 'Болих',
      confirmText: 'Сонгох',
    );
    if (picked != null) setState(() => _date = picked);
  }

  Future<void> _pickTime() async {
    final picked = await showTimePicker(
      context: context,
      initialTime: _time ?? TimeOfDay.now(),
      helpText: 'Цаг сонгох',
      cancelText: 'Болих',
      confirmText: 'Сонгох',
      builder: (BuildContext context, Widget? child) => MediaQuery(
        // Монголд 24 цагийн бичиглэл хэрэглэдэг.
        data: MediaQuery.of(context).copyWith(alwaysUse24HourFormat: true),
        child: child!,
      ),
    );
    if (picked != null) setState(() => _time = picked);
  }

  num? _num(TextEditingController controller) {
    final raw = controller.text.trim().replaceAll(',', '.');
    if (raw.isEmpty) return null;
    return num.tryParse(raw);
  }

  Future<void> _save() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    final draft = JournalDraft(
      date: _date,
      time: _time == null
          ? null
          : '${_time!.hour.toString().padLeft(2, '0')}:'
              '${_time!.minute.toString().padLeft(2, '0')}',
      systolic: _num(_systolic),
      diastolic: _num(_diastolic),
      pulse: _num(_pulse),
      weight: _num(_weight),
      inr: _num(_inr),
      comment: _comment.text,
    );

    // Бүх хэмжилт хоосон, тайлбар ч байхгүй бол хадгалах утгагүй.
    final hasAnything = draft.systolic != null ||
        draft.diastolic != null ||
        draft.pulse != null ||
        draft.weight != null ||
        draft.inr != null ||
        (draft.comment ?? '').trim().isNotEmpty;
    if (!hasAnything) {
      AppSnack.error(
        context,
        'Дор хаяж нэг хэмжилт эсвэл тайлбар оруулна уу.',
      );
      return;
    }

    // Маршрут хаагдсаны дараа мэдэгдэл харуулах тул эдгээрийг урьдчилан барина.
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);

    setState(() => _saving = true);
    final result = await context.read<JournalController>().create(draft);
    if (!mounted) return;
    setState(() => _saving = false);

    if (!result.success) {
      AppSnack.error(
        context,
        result.error?.message ?? 'Хадгалах үед алдаа гарлаа.',
      );
      return;
    }

    navigator.pop(true);
    if (result.diastolicDropped) {
      // Хэрэглэгчийн оруулсан утга чимээгүй алга болохоос сэргийлж хэлнэ.
      AppSnack.infoOn(
        messenger,
        'Доод даралтыг эмнэлгийн систем одоогоор хадгалдаггүй тул '
        'зөвхөн дээд даралт бүртгэгдлээ.',
      );
    } else {
      AppSnack.successOn(messenger, 'Тэмдэглэл хадгалагдлаа.');
    }
  }
}

class _NumberField extends StatelessWidget {
  const _NumberField({
    required this.controller,
    required this.label,
    required this.hint,
    this.validator,
    this.allowDecimal = false,
  });

  final TextEditingController controller;
  final String label;
  final String hint;
  final String? Function(String?)? validator;
  final bool allowDecimal;

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      keyboardType: TextInputType.numberWithOptions(decimal: allowDecimal),
      inputFormatters: <TextInputFormatter>[
        FilteringTextInputFormatter.allow(
          allowDecimal ? RegExp(r'[0-9.,]') : RegExp(r'[0-9]'),
        ),
        LengthLimitingTextInputFormatter(allowDecimal ? 6 : 3),
      ],
      decoration: InputDecoration(labelText: label, hintText: hint),
      validator: validator,
    );
  }
}

class _PickerTile extends StatelessWidget {
  const _PickerTile({
    required this.label,
    required this.value,
    required this.icon,
    required this.onTap,
    this.onClear,
  });

  final String label;
  final String value;
  final IconData icon;
  final VoidCallback onTap;
  final VoidCallback? onClear;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Row(
          children: <Widget>[
            Icon(icon, size: 20, color: theme.colorScheme.primary),
            const SizedBox(width: 12),
            Expanded(child: Text(label, style: theme.textTheme.bodyMedium)),
            Text(
              value,
              style: theme.textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            if (onClear != null)
              IconButton(
                onPressed: onClear,
                visualDensity: VisualDensity.compact,
                tooltip: 'Арилгах',
                icon: const Icon(Icons.close_rounded, size: 18),
              )
            else
              const Padding(
                padding: EdgeInsets.only(left: 6),
                child: Icon(Icons.chevron_right_rounded, size: 20),
              ),
          ],
        ),
      ),
    );
  }
}
