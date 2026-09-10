import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';

import 'core/auth/auth_controller.dart';
import 'core/network/api_client.dart';
import 'core/storage/secure_store.dart';
import 'features/advice/advice_controller.dart';
import 'features/auth/biometric_gate_screen.dart';
import 'features/auth/login_screen.dart';
import 'features/chat/chat_controller.dart';
import 'features/chat/chat_repository.dart';
import 'features/chat/chat_socket.dart';
import 'features/doctor/doctor_controllers.dart';
import 'features/doctor/doctor_repository.dart';
import 'features/doctor/doctor_shell.dart';
import 'features/evisits/evisits_controller.dart';
import 'features/home/main_shell.dart';
import 'features/journal/journal_controller.dart';
import 'features/journal/journal_repository.dart';
import 'features/profile/profile_controller.dart';
import 'features/profile/profile_repository.dart';
import 'features/questions/questions_controller.dart';
import 'features/rehab/rehab_controller.dart';
import 'features/risk/risk_controller.dart';
import 'shared/theme/app_theme.dart';

/// Апп-ын үндэс.
///
/// Хэл нь **монгол, тогтмол**. Төхөөрөмжийн хэлээр солигддоггүй бөгөөд англи
/// локал огт байхгүй: Техникийн шаардлага §1.3.11-ийн дагуу интерфэйс монгол
/// байх ёстой, "хөгжүүлэлтэд зориулж" англи локал нэмбэл эргээд алдагдана.
class MnCardioApp extends StatelessWidget {
  const MnCardioApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'МнКардио',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light(),
      darkTheme: AppTheme.dark(),
      themeMode: ThemeMode.system,
      locale: const Locale('mn'),
      supportedLocales: const <Locale>[Locale('mn')],
      localizationsDelegates: const <LocalizationsDelegate<dynamic>>[
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      builder: (BuildContext context, Widget? child) {
        // Хэрэглэгч системийн үсгийн хэмжээг маш том тавьсан ч зохиомж
        // задрахгүй байх дээд хязгаар. Хүртээмжийн үүднээс 1.0-ээс доош
        // хумихгүй.
        final scale = MediaQuery.textScalerOf(context).clamp(
          minScaleFactor: 1.0,
          maxScaleFactor: 1.5,
        );
        return MediaQuery(
          data: MediaQuery.of(context).copyWith(textScaler: scale),
          child: child ?? const SizedBox.shrink(),
        );
      },
      home: const _AuthGate(),
    );
  }
}

/// Нэвтрэлтийн төлөвөөр дэлгэц сонгоно.
class _AuthGate extends StatelessWidget {
  const _AuthGate();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();

    return switch (auth.status) {
      AuthStatus.unknown => const _SplashScreen(),
      AuthStatus.unauthenticated => const LoginScreen(),
      AuthStatus.locked => const BiometricGateScreen(),
      // Дэлгэцийн бүтэц нь хадгалсан `RoleId`-аар шийдэгдэнэ, нэвтрэх дэлгэц
      // дээрх сонголтоор биш. Эрхийг сервер тогтооно.
      AuthStatus.authenticated => auth.isDoctorSession
          ? DoctorScope(
              key: ValueKey<int>(auth.user?.id ?? 0),
              api: auth.api,
              store: context.read<SecureStore>(),
              child: const DoctorShell(),
            )
          : PatientScope(
              // Хэрэглэгч солигдвол бүх хяналт шинээр үүснэ — өмнөх хүний
              // тэмдэглэл, чат хоцрох боломжгүй.
              key: ValueKey<int>(auth.user?.id ?? 0),
              api: auth.api,
              store: context.read<SecureStore>(),
              child: const MainShell(),
            ),
    };
  }
}

/// Эмч нэвтэрсэн үеийн repository ба controller-ууд.
class DoctorScope extends StatelessWidget {
  const DoctorScope({
    super.key,
    required this.api,
    required this.store,
    required this.child,
  });

  final ApiClient api;
  final SecureStore store;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final doctorRepo = DoctorRepository(api);
    final chatRepo = ChatRepository(api);

    return MultiProvider(
      providers: [
        Provider<DoctorRepository>.value(value: doctorRepo),
        Provider<ChatRepository>.value(value: chatRepo),
        Provider<ChatSocket>(
          create: (_) => ChatSocket(store),
          dispose: (_, ChatSocket socket) => socket.dispose(),
        ),

        ChangeNotifierProvider<DoctorProfileController>(
          create: (_) => DoctorProfileController(doctorRepo),
        ),

        // 1.1 Миний үзлэгүүд
        ChangeNotifierProvider<DoctorVisitsController>(
          create: (_) => DoctorVisitsController(doctorRepo),
        ),

        // 1.2 Миний хяналт
        ChangeNotifierProvider<DoctorMonitoringController>(
          create: (_) => DoctorMonitoringController(doctorRepo),
        ),

        // 1.3 Миний зөвлөгөө
        ChangeNotifierProvider<DoctorAdviceController>(
          create: (_) => DoctorAdviceController(doctorRepo),
        ),

        // 1.4 Миний тайлан
        ChangeNotifierProvider<DoctorReportController>(
          create: (_) => DoctorReportController(doctorRepo),
        ),

        // Чат — эмч, үйлчлүүлэгч хоёуланд ижил гадаргуу.
        ChangeNotifierProvider<ChatRoomsController>(
          create: (BuildContext context) => ChatRoomsController(
            chatRepo,
            context.read<ChatSocket>(),
          ),
        ),
      ],
      child: child,
    );
  }
}

/// Үйлчлүүлэгч нэвтэрсэн үеийн бүх repository, controller-ыг нэг дор угсарна.
///
/// Нэвтэрсэн үед үүсч, гарахад устдаг тул нэг хэрэглэгчийн өгөгдөл нөгөөд
/// үлдэх боломжгүй.
class PatientScope extends StatelessWidget {
  const PatientScope({
    super.key,
    required this.api,
    required this.store,
    required this.child,
  });

  final ApiClient api;
  final SecureStore store;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    final journalRepo = JournalRepository(api);
    final chatRepo = ChatRepository(api);

    return MultiProvider(
      providers: [
        // --- Repository-ууд ---
        Provider<ChatRepository>.value(value: chatRepo),
        Provider<ChatSocket>(
          create: (_) => ChatSocket(store),
          dispose: (_, ChatSocket socket) => socket.dispose(),
        ),

        // --- 2.1 Миний бүртгэл ---
        ChangeNotifierProvider<ProfileController>(
          create: (_) => ProfileController(ProfileRepository(api)),
        ),

        // --- 2.2 Миний тэмдэглэл ---
        ChangeNotifierProvider<JournalController>(
          create: (_) => JournalController(journalRepo),
        ),
        ChangeNotifierProvider<JournalSummaryController>(
          create: (_) => JournalSummaryController(journalRepo),
        ),

        // --- 2.3 Эмчээс асуух асуулт ---
        ChangeNotifierProvider<QuestionsController>(
          create: (_) => QuestionsController(QuestionsRepository(api)),
        ),

        // --- 2.4 Эмчийн зөвлөгөө ---
        ChangeNotifierProvider<AdviceController>(
          create: (_) => AdviceController(AdviceRepository(api)),
        ),

        // --- 2.5 Эрсдэл үнэлгээ ---
        ChangeNotifierProvider<RiskController>(
          create: (_) => RiskController(RiskRepository(api)),
        ),

        // --- 2.6 Цахим үзлэг ---
        ChangeNotifierProvider<EvisitsController>(
          create: (_) => EvisitsController(EvisitsRepository(api)),
        ),

        // --- 2.7 Сэргээн засах ---
        ChangeNotifierProvider<RehabController>(
          create: (_) => RehabController(RehabRepository(api)),
        ),

        // --- Чат ---
        ChangeNotifierProvider<ChatRoomsController>(
          create: (BuildContext context) => ChatRoomsController(
            chatRepo,
            context.read<ChatSocket>(),
          ),
        ),
      ],
      child: child,
    );
  }
}

class _SplashScreen extends StatelessWidget {
  const _SplashScreen();

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Container(
              width: 76,
              height: 76,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: theme.colorScheme.primary.withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(22),
              ),
              child: Icon(
                Icons.favorite_rounded,
                size: 38,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(height: 20),
            Text('МнКардио', style: theme.textTheme.titleLarge),
            const SizedBox(height: 22),
            const SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(strokeWidth: 2.4),
            ),
          ],
        ),
      ),
    );
  }
}
