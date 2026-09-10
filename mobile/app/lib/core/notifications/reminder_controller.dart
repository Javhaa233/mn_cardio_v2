import 'dart:convert';

import 'package:flutter/foundation.dart';

import '../storage/prefs.dart';
import 'local_notifications.dart';
import 'reminder.dart';

/// Сануулгын жагсаалтыг эзэмшигч.
///
/// Жагсаалт нь төхөөрөмж дээр `shared_preferences`-д хадгалагдана: эдгээр нь
/// эмнэлзүйн өгөгдөл биш, хэрэглэгчийн өөрийн тав тухын тохиргоо бөгөөд
/// серверт хадгалах endpoint байхгүй.
class ReminderController extends ChangeNotifier {
  ReminderController(this._prefs);

  final Prefs _prefs;

  List<Reminder> _reminders = const <Reminder>[];
  bool _permissionGranted = false;

  List<Reminder> get reminders => _reminders;
  bool get permissionGranted => _permissionGranted;
  bool get hasEnabled => _reminders.any((Reminder r) => r.enabled);

  Future<void> load() async {
    final raw = _prefs.remindersJson;
    if (raw == null || raw.isEmpty) {
      _reminders = const <Reminder>[];
      notifyListeners();
      return;
    }
    try {
      final decoded = jsonDecode(raw);
      if (decoded is List) {
        _reminders = decoded
            .whereType<Map<dynamic, dynamic>>()
            .map((Map<dynamic, dynamic> e) =>
                Reminder.fromJson(Map<String, dynamic>.from(e)))
            .toList(growable: false);
      }
    } catch (_) {
      // Гэмтсэн бичлэг — сануулга алдагдах нь эмнэлзүйн өгөгдөл алдахаас
      // хамаагүй хямд, хэрэглэгч дахин тохируулна.
      _reminders = const <Reminder>[];
    }
    notifyListeners();
  }

  /// Зөвшөөрөл асууж, амжилттай бол идэвхтэй сануулгуудыг дахин төлөвлөнө.
  Future<bool> requestPermission() async {
    _permissionGranted = await LocalNotifications.requestPermission();
    notifyListeners();
    if (_permissionGranted) await _rescheduleAll();
    return _permissionGranted;
  }

  /// Шинэ сануулга нэмнэ. `id` нь 0 бол дараагийн сул дугаарыг өгнө.
  Future<void> add(Reminder reminder) async {
    final created =
        reminder.id == 0 ? _withId(reminder, _nextId()) : reminder;
    await _persist(<Reminder>[..._reminders, created]);
    await LocalNotifications.schedule(created);
  }

  Future<void> update(Reminder reminder) async {
    final next = _reminders
        .map((Reminder r) => r.id == reminder.id ? reminder : r)
        .toList(growable: false);
    await _persist(next);
    await LocalNotifications.schedule(reminder);
  }

  Future<void> toggle(Reminder reminder, bool enabled) async {
    if (enabled && !_permissionGranted) {
      final granted = await requestPermission();
      if (!granted) return;
    }
    await update(reminder.copyWith(enabled: enabled));
  }

  Future<void> remove(Reminder reminder) async {
    await LocalNotifications.cancel(reminder);
    final next = _reminders
        .where((Reminder r) => r.id != reminder.id)
        .toList(growable: false);
    await _persist(next);
  }

  /// Гарах үед бүх сануулгыг цуцална — өөр хэрэглэгч нэвтэрч болзошгүй.
  Future<void> clearAll() async {
    await LocalNotifications.cancelAll();
    await _persist(const <Reminder>[]);
  }

  /// Мэдэгдлийн танигч нь `id * 10 + өдөр` тул дугаар давхцах ёсгүй.
  int _nextId() {
    var maxId = 0;
    for (final r in _reminders) {
      if (r.id > maxId) maxId = r.id;
    }
    return maxId + 1;
  }

  Reminder _withId(Reminder source, int id) => Reminder(
        id: id,
        type: source.type,
        hour: source.hour,
        minute: source.minute,
        title: source.title,
        note: source.note,
        weekdays: source.weekdays,
        enabled: source.enabled,
      );

  Future<void> _rescheduleAll() async {
    for (final reminder in _reminders) {
      await LocalNotifications.schedule(reminder);
    }
  }

  Future<void> _persist(List<Reminder> next) async {
    _reminders = next;
    await _prefs.setRemindersJson(
      jsonEncode(next.map((Reminder r) => r.toJson()).toList()),
    );
    notifyListeners();
  }
}
