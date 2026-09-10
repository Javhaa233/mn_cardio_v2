import 'package:flutter/material.dart';

/// Сануулгын төрөл — Техникийн шаардлага §37:
/// "Үйлчлүүлэгч өөрийн хүссэн цаг, төрлөөр (эм уух, дасгал хийх, хяналтын
/// үзлэгийн цаг) мэдэгдлийг тохируулах боломжтой байх."
enum ReminderType { medication, exercise, checkup, measurement }

extension ReminderTypeX on ReminderType {
  String get label => switch (this) {
        ReminderType.medication => 'Эм уух',
        ReminderType.exercise => 'Дасгал хийх',
        ReminderType.checkup => 'Хяналтын үзлэг',
        ReminderType.measurement => 'Даралт, жин хэмжих',
      };

  IconData get icon => switch (this) {
        ReminderType.medication => Icons.medication_outlined,
        ReminderType.exercise => Icons.self_improvement_outlined,
        ReminderType.checkup => Icons.event_available_outlined,
        ReminderType.measurement => Icons.monitor_heart_outlined,
      };

  /// Мэдэгдэл дээр гарах үндсэн текст.
  String get defaultBody => switch (this) {
        ReminderType.medication => 'Эмээ уух цаг боллоо.',
        ReminderType.exercise => 'Дасгалаа хийх цаг боллоо.',
        ReminderType.checkup => 'Хяналтын үзлэгийн цаг ойртлоо.',
        ReminderType.measurement =>
          'Даралт, судасны цохилтоо хэмжиж тэмдэглэнэ үү.',
      };

  String get storageKey => name;

  static ReminderType parse(String? value) {
    for (final type in ReminderType.values) {
      if (type.name == value) return type;
    }
    return ReminderType.medication;
  }
}

/// Нэг сануулга.
///
/// Эдгээр нь **төхөөрөмж дээр** төлөвлөгддөг. Backend-д FCM/APNs огт байхгүй
/// тул серверээс түлхэх мэдэгдэл байхгүй (READINESS.md §4). Тогтмол цагийн
/// сануулгыг үйлдлийн систем өөрөө хүргэдэг тул апп хаалттай байсан ч ажиллана.
class Reminder {
  const Reminder({
    required this.id,
    required this.type,
    required this.hour,
    required this.minute,
    this.title,
    this.note,
    this.weekdays = const <int>{1, 2, 3, 4, 5, 6, 7},
    this.enabled = true,
  });

  final int id;
  final ReminderType type;
  final int hour;
  final int minute;
  final String? title;
  final String? note;

  /// 1 = Даваа … 7 = Ням. Хоосон бол өдөр бүр.
  final Set<int> weekdays;

  final bool enabled;

  String get displayTitle {
    final custom = (title ?? '').trim();
    return custom.isEmpty ? type.label : custom;
  }

  String get displayBody {
    final custom = (note ?? '').trim();
    return custom.isEmpty ? type.defaultBody : custom;
  }

  TimeOfDay get timeOfDay => TimeOfDay(hour: hour, minute: minute);

  String get timeLabel =>
      '${hour.toString().padLeft(2, '0')}:${minute.toString().padLeft(2, '0')}';

  bool get isDaily => weekdays.length >= 7;

  String get weekdayLabel {
    if (isDaily) return 'Өдөр бүр';
    const names = <int, String>{
      1: 'Да',
      2: 'Мя',
      3: 'Лх',
      4: 'Пү',
      5: 'Ба',
      6: 'Бя',
      7: 'Ня',
    };
    final sorted = weekdays.toList()..sort();
    return sorted.map((int d) => names[d] ?? '').join(', ');
  }

  Reminder copyWith({
    ReminderType? type,
    int? hour,
    int? minute,
    String? title,
    String? note,
    Set<int>? weekdays,
    bool? enabled,
  }) =>
      Reminder(
        id: id,
        type: type ?? this.type,
        hour: hour ?? this.hour,
        minute: minute ?? this.minute,
        title: title ?? this.title,
        note: note ?? this.note,
        weekdays: weekdays ?? this.weekdays,
        enabled: enabled ?? this.enabled,
      );

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id': id,
        'type': type.name,
        'hour': hour,
        'minute': minute,
        if (title != null) 'title': title,
        if (note != null) 'note': note,
        'weekdays': weekdays.toList()..sort(),
        'enabled': enabled,
      };

  factory Reminder.fromJson(Map<String, dynamic> json) {
    final rawDays = json['weekdays'];
    final days = <int>{};
    if (rawDays is List) {
      for (final d in rawDays) {
        if (d is int && d >= 1 && d <= 7) days.add(d);
      }
    }
    return Reminder(
      id: (json['id'] as num?)?.toInt() ?? 0,
      type: ReminderTypeX.parse(json['type'] as String?),
      hour: (json['hour'] as num?)?.toInt() ?? 8,
      minute: (json['minute'] as num?)?.toInt() ?? 0,
      title: json['title'] as String?,
      note: json['note'] as String?,
      weekdays: days.isEmpty ? const <int>{1, 2, 3, 4, 5, 6, 7} : days,
      enabled: json['enabled'] as bool? ?? true,
    );
  }
}
