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
/// Чатын шинэ мессежийг апп **ажиллаж байх үед** socket-оор мэдээд энэ
/// сувгаар харуулна ([showChat]). Апп бүрэн хаагдсан үед socket байхгүй тул
/// тэр тохиолдолд push хэрэгтэй хэвээр (BLOCKERS.md §3).
class LocalNotifications {
  LocalNotifications._();

  static final FlutterLocalNotificationsPlugin _plugin =
      FlutterLocalNotificationsPlugin();

  static bool _ready = false;

  /// Мэдэгдэл дээр дарахад дуудагдана. Чиглүүлэгчийг `main` холбоно —
  /// core давхарга дэлгэцүүдийг мэддэггүй байх ёстой.
  static Future<void> Function(String payload)? onTap;

  /// Апп хаалттай байхад дарсан мэдэгдлийн ачаа. Нэвтрэлт сэргэсний дараа
  /// [takeLaunchPayload]-аар нэг л удаа авна.
  static String? _launchPayload;

  static const AndroidNotificationChannel _channel = AndroidNotificationChannel(
    'mncardio_reminders',
    'Сануулга',
    description: 'Эм уух, дасгал хийх, хяналтын үзлэгийн сануулга',
    importance: Importance.high,
  );

  /// Чат нь сануулгаас тусдаа суваг — хэрэглэгч аль нэгийг нь дангаар нь
  /// хаах эрхтэй байх ёстой (Android-ын суваг тус бүрийн тохиргоо).
  static const AndroidNotificationChannel _chatChannel =
      AndroidNotificationChannel(
    'mncardio_chat',
    'Чат',
    description: 'Эмч, үйлчлүүлэгчийн шинэ мессеж',
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

    await _plugin.initialize(
      settings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
        final payload = response.payload;
        if (payload == null || payload.isEmpty) return;
        final handler = onTap;
        if (handler == null) {
          // Чиглүүлэгч бэлэн болоогүй (апп сэргэж байна) — хойшлуулна.
          _launchPayload = payload;
          return;
        }
        handler(payload);
      },
    );

    final android = _plugin.resolvePlatformSpecificImplementation<
        AndroidFlutterLocalNotificationsPlugin>();
    await android?.createNotificationChannel(_channel);
    await android?.createNotificationChannel(_chatChannel);

    // Апп бүрэн хаалттай байхад мэдэгдэл дээр дарж нээсэн бол `initialize`-ийн
    // callback хэзээ ч дуудагдахгүй — ачааг эндээс л олно.
    final launch = await _plugin.getNotificationAppLaunchDetails();
    if (launch != null &&
        launch.didNotificationLaunchApp &&
        launch.notificationResponse?.payload != null) {
      _launchPayload = launch.notificationResponse!.payload;
    }

    _ready = true;
  }

  /// Апп нээгдэхэд дарагдсан байсан мэдэгдлийн ачааг нэг удаа буцаана.
  static String? takeLaunchPayload() {
    final value = _launchPayload;
    _launchPayload = null;
    return value;
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
        payload: 'reminder:${reminder.id}',
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

  /// Чатын шинэ мессежийг мэдэгдэх.
  ///
  /// Мэдэгдлийн дугаарыг өрөөгөөр өгнө — нэг өрөөний дараачийн мессеж өмнөхийг
  /// **солино**, арван мессеж арван мөр болж хураадаггүй.
  static Future<void> showChat({
    required int chatRoomId,
    required String title,
    required String body,
  }) async {
    await init();
    await _plugin.show(
      _chatNotificationId(chatRoomId),
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          _chatChannel.id,
          _chatChannel.name,
          channelDescription: _chatChannel.description,
          importance: Importance.high,
          priority: Priority.high,
          category: AndroidNotificationCategory.message,
        ),
        iOS: const DarwinNotificationDetails(
          // Апп нээлттэй байхад ч харагдана: хэрэглэгч өөр дэлгэц дээр байвал
          // мессеж ирснийг мэдэх ёстой.
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: 'chat:$chatRoomId',
    );
  }

  /// Чатын мэдэгдлийг өрөөгөөр нь давхцуулахгүй дугаарлана. Сануулгын
  /// дугаартай мөргөлдөхгүйн тулд тусдаа мужид байрлуулав.
  static int _chatNotificationId(int chatRoomId) => 900000 + chatRoomId % 90000;

  /// Өрөөг нээхэд түүний мэдэгдлийг цуцална.
  static Future<void> clearChat(int chatRoomId) async {
    await init();
    await _plugin.cancel(_chatNotificationId(chatRoomId));
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
