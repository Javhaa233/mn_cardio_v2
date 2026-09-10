import 'package:flutter/material.dart';

import '../../core/util/mn_format.dart';

/// Хугацааны интервал — Техникийн шаардлага §13 "Мэдээллийг хугацааны
/// интервалаар хайдаг байх".
class DateRange {
  const DateRange({this.from, this.to});

  final DateTime? from;
  final DateTime? to;

  bool get isEmpty => from == null && to == null;

  /// Сервер рүү явуулах `?from` / `?to` параметрүүд.
  Map<String, dynamic> toQuery() => <String, dynamic>{
        if (from != null) 'from': MnFormat.apiDate(from!),
        if (to != null) 'to': MnFormat.apiDate(to!),
      };

  String get label {
    if (from == null && to == null) return 'Бүх хугацаа';
    if (from != null && to != null) {
      return '${MnFormat.date(from)} – ${MnFormat.date(to)}';
    }
    if (from != null) return '${MnFormat.date(from)}-аас';
    return '${MnFormat.date(to)} хүртэл';
  }

  static DateRange lastDays(int days) {
    final now = DateTime.now();
    return DateRange(
      from: DateTime(now.year, now.month, now.day)
          .subtract(Duration(days: days - 1)),
      to: DateTime(now.year, now.month, now.day),
    );
  }

  static const DateRange all = DateRange();

  @override
  bool operator ==(Object other) =>
      other is DateRange && other.from == from && other.to == to;

  @override
  int get hashCode => Object.hash(from, to);
}

/// Хугацааны шүүлтүүрийн мөр: түргэн сонголтууд + өөрөө сонгох.
class DateRangeFilterBar extends StatelessWidget {
  const DateRangeFilterBar({
    super.key,
    required this.value,
    required this.onChanged,
    this.presets = const <int>[7, 30, 90],
  });

  final DateRange value;
  final ValueChanged<DateRange> onChanged;
  final List<int> presets;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: <Widget>[
          ChoiceChip(
            label: const Text('Бүгд'),
            selected: value.isEmpty,
            onSelected: (_) => onChanged(DateRange.all),
          ),
          for (final days in presets) ...<Widget>[
            const SizedBox(width: 8),
            ChoiceChip(
              label: Text(_presetLabel(days)),
              selected: value == DateRange.lastDays(days),
              onSelected: (_) => onChanged(DateRange.lastDays(days)),
            ),
          ],
          const SizedBox(width: 8),
          ActionChip(
            avatar: const Icon(Icons.date_range_rounded, size: 17),
            label: Text(_customLabel()),
            onPressed: () => _pick(context),
          ),
        ],
      ),
    );
  }

  String _presetLabel(int days) {
    if (days == 7) return '7 хоног';
    if (days == 30) return '1 сар';
    if (days == 90) return '3 сар';
    if (days == 180) return '6 сар';
    if (days == 365) return '1 жил';
    return '$days хоног';
  }

  String _customLabel() {
    if (value.isEmpty) return 'Хугацаа сонгох';
    final isPreset = presets.any((int d) => value == DateRange.lastDays(d));
    return isPreset ? 'Хугацаа сонгох' : value.label;
  }

  Future<void> _pick(BuildContext context) async {
    final now = DateTime.now();
    final picked = await showDateRangePicker(
      context: context,
      firstDate: DateTime(now.year - 10),
      lastDate: DateTime(now.year, now.month, now.day),
      initialDateRange: value.from != null && value.to != null
          ? DateTimeRange(start: value.from!, end: value.to!)
          : null,
      helpText: 'Хугацааны интервал сонгох',
      cancelText: 'Болих',
      confirmText: 'Сонгох',
      saveText: 'Сонгох',
      fieldStartLabelText: 'Эхлэх огноо',
      fieldEndLabelText: 'Дуусах огноо',
      errorInvalidRangeText: 'Огнооны интервал буруу байна',
      errorFormatText: 'Огноог зөв оруулна уу',
      errorInvalidText: 'Боломжит хугацаанаас гадуур байна',
    );
    if (picked != null) {
      onChanged(DateRange(from: picked.start, to: picked.end));
    }
  }
}
