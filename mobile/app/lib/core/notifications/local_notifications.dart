import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_timezone/flutter_timezone.dart';
import 'package:timezone/data/latest_all.dart' as tzdata;
import 'package:timezone/timezone.dart' as tz;

import 'reminder.dart';

/// Төхөөрөмж дээрх мэдэгдлийн үйлчилгээ.
///
/// **Яагаад локал мэдэгдэл вэ:** backend-д FCM, APNs, web-push аль нь ч
/// байхгүй (READINESS.md §4) тул серверээс түлхэх мэдэгдэл байхгүй. Тогтмол
/// цагийн сануулгыг үйлдлийн систем өөрөө хүргэдэг тул энэ нь push-гүйгээр
/// найдвартай ажиллах цорын ганц зам.
///
/// Чатын шинэ мессеж зэрэг **серверээс үүдэлтэй** мэдэгдлийг энэ аргаар
/// хийж болохгүй — тэдгээр нь push шаардана.
class LocalNotifications {
  LocalNotifications._();

  static final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  static bool _ready = false;

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'mncardio_reminders',
    'Сануулга',
    description: 'Эм уух, дасгал хийх, хяналтын үзлэгийн сануулга',
    importance: Importance.high,
  );

  static Future<void> init() async {
    if (_ready) return;

    tzdata.initializeTimeZones();
    try {
      final name = (await FlutterTimezone.getLocalTimezone()).identifier;
      tz.setLocalLocation(tz.getLocation(name));
    } catch (_) {
      // Улаанбаатарын цагийн бүс — эталон цагийн тохиргоо олдоогүй үеийн
      // нөөц сонголт.
      tz.setLocalLocation(tz.getLocation('Asia/Ulaanbaatar'));
    }

    const settings = InitializationSettings(
      android: AndroidInitializationSettings('@mipmap/ic_launcher'),
      iOS: DarwinInitializationSettings(
        // Зөвшөөрлийг хэрэглэгч сануулга үүсгэх мөчид асууна — апп эхлэх
        // үед биш. Ингэснээр яагаад асууж байгаа нь ойлгомжтой.
        requestAlertPermission: false,
        requestBadgePermission: false,
        requestSoundPermission: false,
      ),
    );

    await _plugin.initialize(settings);

    await _plugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(_channel);

    _ready = true;
  }

  /// Мэдэгдэл харуулах зөвшөөрөл асуух.
  static Future<bool> requestPermission() async {
    await init();

    final android = _plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    if (android != null) {
      final granted = await android.requestNotificationsPermission();
      // Android 12+ дээр яг цагт нь сэрээхэд тусдаа зөвшөөрөл хэрэгтэй.
      await android.requestExactAlarmsPermission();
      return granted ?? false;
    }

    final ios = _plugin.resolvePlatformSpecificImplementation<
        IOSFlutterLocalNotificationsPlugin>();
    if (ios != null) {
      final granted = await ios.requestPermissions(
        alert: true,
        badge: true,
        sound: true,
      );
      return granted ?? false;
    }

    return false;
  }

  /// Сануулгыг төлөвлөнө.
  ///
  /// Долоо хоногийн сонгосон өдрүүд тус бүрд тусдаа мэдэгдэл үүсгэнэ —
  /// `matchDateTimeComponents` нь долоо хоногийн олон өдрийг нэг мэдэгдлээр
  /// илэрхийлэх боломжгүй.
  static Future<void> schedule(Reminder reminder) async {
    await init();
    await cancel(reminder);
    if (!reminder.enabled) return;

    final details = NotificationDetails(
      android: AndroidNotificationDetails(
        _channel.id,
        _channel.name,
        channelDescription: _channel.description,
        importance: Importance.high,
        priority: Priority.high,
        category: AndroidNotificationCategory.reminder,
      ),
      iOS: const DarwinNotificationDetails(),
    );

    for (final weekday in reminder.weekdays) {
      await _plugin.zonedSchedule(
        _notificationId(reminder, weekday),
        reminder.displayTitle,
        reminder.displayBody,
        _nextInstanceOf(reminder.hour, reminder.minute, weekday),
        details,
        // `inexact`: Android 12+ дээр `exact` нь тусгай зөвшөөрөл шаарддаг
        // бөгөөд хэрэглэгч татгалзвал төлөвлөлт алдаа өгнө. Хэдэн минутын
        // зөрүү нь сануулга огт ирэхгүй байхаас дээр.
        androidScheduleMode: AndroidScheduleMode.inexactAllowWhileIdle,
        uiLocalNotificationDateInterpretation:
            UILocalNotificationDateInterpretation.absoluteTime,
        matchDateTimeComponents: DateTimeComponents.dayOfWeekAndTime,
      );
    }
  }

  static Future<void> cancel(Reminder reminder) async {
    await init();
    // Долоо хоногийн бүх өдрийг цуцална — өдрийн сонголт өөрчлөгдсөн байж
    // болзошгүй тул зөвхөн одоогийн сонголтоор цуцлах нь хангалтгүй.
    for (var weekday = 1; weekday <= 7; weekday++) {
      await _plugin.cancel(_notificationId(reminder, weekday));
    }
  }

  static Future<void> cancelAll() async {
    await init();
    await _plugin.cancelAll();
  }

  /// Сануулга бүрийн өдөр тус бүрд давтагдашгүй танигч.
  static int _notificationId(Reminder reminder, int weekday) =>
      reminder.id * 10 + weekday;

  static tz.TZDateTime _nextInstanceOf(int hour, int minute, int weekday) {
    final now = tz.TZDateTime.now(tz.local);
    var scheduled = tz.TZDateTime(
      tz.local,
      now.year,
      now.month,
      now.day,
      hour,
      minute,
    );
    while (scheduled.weekday != weekday || !scheduled.isAfter(now)) {
      scheduled = scheduled.add(const Duration(days: 1));
    }
    return scheduled;
  }

  /// Туршилтын зорилгоор шууд мэдэгдэл харуулах.
  static Future<void> showNow(String title, String body) async {
    await init();
    await _plugin.show(
      DateTime.now().millisecondsSinceEpoch.remainder(100000),
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _channel.id,
          _channel.name,
          channelDescription: _channel.description,
          importance: Importance.high,
          priority: Priority.high,
        ),
        iOS: const DarwinNotificationDetails(),
      ),
    );
    if (kDebugMode) debugPrint('[notifications] шууд мэдэгдэл: $title');
  }
}
