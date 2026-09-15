import 'dart:async';

import 'package:audio_session/audio_session.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'core/auth/auth_controller.dart';
import 'core/notifications/local_notifications.dart';
import 'core/push/push_registrar.dart';
import 'core/notifications/reminder_controller.dart';
import 'core/storage/prefs.dart';
import 'core/network/envelope_interceptor.dart';
import 'core/storage/secure_store.dart';
import 'core/update/update_controller.dart';
import 'features/notifications/notification_router.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Эрүүл мэндийн мэдээлэл харуулдаг апп тул хэвтээ эргэлтийг хаана —
  // зохиомж, график босоо байдлаар шалгагдсан.
  await SystemChrome.setPreferredOrientations(<DeviceOrientation>[
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);

  final prefs = await Prefs.load();
  final store = SecureStore();

  final auth = AuthController(store: store, prefs: prefs)
    // Push токен өгөх эх сурвалж Firebase түлхүүр ирэхэд солигдоно —
    // бүртгэх, салгах урсгал нь одоо ч ажиллана (core/push/push_registrar.dart).
    ..pushRegistrar = PushRegistrar();
  final reminders = ReminderController(prefs);

  // Техникийн шаардлага §2.1 — хувилбарын шалгалт. Билдийн дугаарыг дуудлага
  // бүрт явуулж, сервер хуучин гэж үзвэл (426) аппыг блоклоно.
  final updates = UpdateController();
  await updates.attach(auth.api);
  EnvelopeInterceptor.onUpdateRequired = updates.markBlockedByServer;

  // Дуут мессеж чанга яригчаар сонсогдох ёстой. iOS дээр тохируулаагүй бол
  // чимээгүй горим (хажуугийн унтраалга) асаалттай үед дуу гардаггүй, апп нь
  // эвдэрсэн мэт харагдана. `speech` нь яриа сонсоход зориулсан горим.
  try {
    final session = await AudioSession.instance;
    await session.configure(const AudioSessionConfiguration.speech());
  } catch (_) {
    // Тохируулж чадаагүй нь аппыг зогсоох шалтгаан биш.
  }

  // Мэдэгдлийн сувгийг урьдчилан бэлдэнэ. Зөвшөөрлийг энд асуухгүй —
  // хэрэглэгч сануулга үүсгэх мөчид асуувал яагаад гэдэг нь ойлгомжтой.
  // Мэдэгдэл дээр дарахад хаашаа очихыг features давхарга шийднэ — core нь
  // дэлгэцүүдийг мэдэхгүй байх ёстой.
  LocalNotifications.onTap = routeNotificationPayload;
  await LocalNotifications.init();
  await reminders.load();

  // Хадгалсан сесс байвал сэргээнэ.
  await auth.bootstrap();

  // Хувилбарын шалгалт нэвтрэлт шаардахгүй тул хаана ч зогсохгүй.
  unawaited(updates.check(auth.api));

  runApp(
    MultiProvider(
      providers: [
        Provider<Prefs>.value(value: prefs),
        Provider<SecureStore>.value(value: store),
        ChangeNotifierProvider<AuthController>.value(value: auth),
        ChangeNotifierProvider<ReminderController>.value(value: reminders),
        ChangeNotifierProvider<UpdateController>.value(value: updates),
      ],
      child: const MnCardioApp(),
    ),
  );
}
