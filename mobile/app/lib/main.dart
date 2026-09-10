import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'app.dart';
import 'core/auth/auth_controller.dart';
import 'core/notifications/local_notifications.dart';
import 'core/notifications/reminder_controller.dart';
import 'core/storage/prefs.dart';
import 'core/storage/secure_store.dart';

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

  final auth = AuthController(store: store, prefs: prefs);
  final reminders = ReminderController(prefs);

  // Мэдэгдлийн сувгийг урьдчилан бэлдэнэ. Зөвшөөрлийг энд асуухгүй —
  // хэрэглэгч сануулга үүсгэх мөчид асуувал яагаад гэдэг нь ойлгомжтой.
  await LocalNotifications.init();
  await reminders.load();

  // Хадгалсан сесс байвал сэргээнэ.
  await auth.bootstrap();

  runApp(
    MultiProvider(
      providers: [
        Provider<Prefs>.value(value: prefs),
        Provider<SecureStore>.value(value: store),
        ChangeNotifierProvider<AuthController>.value(value: auth),
        ChangeNotifierProvider<ReminderController>.value(value: reminders),
      ],
      child: const MnCardioApp(),
    ),
  );
}
