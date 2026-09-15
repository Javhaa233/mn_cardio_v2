import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/config/app_config.dart';
import '../../core/util/validators.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/app_snack.dart';
import 'forgot_password_screen.dart';
import 'server_settings_sheet.dart';
import 'terms_screen.dart';

/// Нэвтрэх дэлгэц — эмч, үйлчлүүлэгч хоёуланд.
///
/// Сонгосон хэсэг нь ямар endpoint рүү хандахыг тодорхойлно, гэхдээ **эцсийн
/// эрхийг сервер** буцаасан `RoleId`-аар тогтооно: эмчийн хэсгээр орсон
/// үйлчлүүлэгчийн бүртгэл эмчийн дэлгэц рүү орохгүй.
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _userName = TextEditingController();
  final TextEditingController _password = TextEditingController();
  bool _obscure = true;

  /// Тендер §33 — апп нь эмч, үйлчлүүлэгч гэсэн хоёр нэвтрэх хэсэгтэй.
  late LoginRole _role;

  @override
  void initState() {
    super.initState();
    final auth = context.read<AuthController>();
    _role = auth.lastLoginRole;
    final last = auth.lastUserName;
    if (last != null) _userName.text = last;
  }

  @override
  void dispose() {
    _userName.dispose();
    _password.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final theme = Theme.of(context);

    return Scaffold(
      // Цэвэрхэн цагаан — логоны цэнхэр, ягаан өнгө хамгийн тод харагдах
      // дэвсгэр. Талбарууд сэдвийн цайвар дүүргэлт, үсэн хүрээтэй тул цагаан
      // дээр ялгарна.
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.fromLTRB(24, 32, 24, 32),
            child: ConstrainedBox(
              constraints: const BoxConstraints(maxWidth: 440),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    _Brand(onLongPress: _openServerSettings),
                    const SizedBox(height: 30),
                    _RoleSelector(
                      value: _role,
                      onChanged: (LoginRole value) {
                        setState(() => _role = value);
                      },
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Нэвтрэх',
                      style: theme.textTheme.headlineSmall,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _role == LoginRole.doctor
                          ? 'Эмнэлгийн системийн нэвтрэх нэр, нууц үгээ '
                              'оруулна уу.'
                          : 'Эмнэлгээс олгосон нэвтрэх нэр, нууц үгээ '
                              'оруулна уу.',
                      style: theme.textTheme.bodySmall,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 26),
                    TextFormField(
                      controller: _userName,
                      autocorrect: false,
                      enableSuggestions: false,
                      textInputAction: TextInputAction.next,
                      decoration: const InputDecoration(
                        labelText: 'Нэвтрэх нэр',
                        prefixIcon: Icon(Icons.person_outline_rounded),
                      ),
                      validator: Validators.userName,
                    ),
                    const SizedBox(height: 14),
                    TextFormField(
                      controller: _password,
                      obscureText: _obscure,
                      autocorrect: false,
                      enableSuggestions: false,
                      textInputAction: TextInputAction.done,
                      onFieldSubmitted: (_) => _login(),
                      decoration: InputDecoration(
                        labelText: 'Нууц үг',
                        prefixIcon: const Icon(Icons.lock_outline_rounded),
                        suffixIcon: IconButton(
                          onPressed: () => setState(() => _obscure = !_obscure),
                          tooltip: _obscure ? 'Харах' : 'Нуух',
                          icon: Icon(
                            _obscure
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                          ),
                        ),
                      ),
                      validator: Validators.password,
                    ),
                    const SizedBox(height: 8),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: _openForgotPassword,
                        child: const Text('Нууц үгээ мартсан уу?'),
                      ),
                    ),
                    if (auth.shouldWarnAboutAttempts) ...<Widget>[
                      const SizedBox(height: 6),
                      _AttemptWarning(attempts: auth.failedAttempts),
                    ],
                    const SizedBox(height: 18),
                    FilledButton(
                      onPressed: auth.busy ? null : _login,
                      child: auth.busy
                          ? const SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2.4,
                                color: Colors.white,
                              ),
                            )
                          : const Text('Нэвтрэх'),
                    ),
                    // Товчийг зөвхөн сэргээх сесс байгаа үед харуулна —
                    // гарсны дараа хурууны хээ нээх юмгүй.
                    if (auth.canUnlockWithBiometrics) ...<Widget>[
                      const SizedBox(height: 12),
                      OutlinedButton.icon(
                        onPressed: auth.busy ? null : _unlockWithBiometrics,
                        icon: const Icon(Icons.fingerprint_rounded),
                        label: const Text('Хурууны хээгээр нэвтрэх'),
                      ),
                    ],
                    const SizedBox(height: 26),
                    TextButton(
                      onPressed: () => Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => const TermsScreen(),
                        ),
                      ),
                      child: const Text('Үйлчилгээний нөхцөл'),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _login() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    final auth = context.read<AuthController>();
    final ok = await auth.login(
      userName: _userName.text,
      password: _password.text,
      role: _role,
    );
    if (!mounted) return;

    if (!ok) {
      AppSnack.error(context, auth.lastError ?? 'Нэвтрэх боломжгүй байна.');
      return;
    }

    _password.clear();

    // Амжилттай нэвтэрсний дараа биометрээр нэвтрэхийг санал болгоно.
    if (auth.biometricAvailable && !auth.biometricEnabled) {
      await _offerBiometric(auth);
    }
  }

  Future<void> _offerBiometric(AuthController auth) async {
    final accepted = await confirmDialog(
      context,
      title: 'Хурууны хээгээр нэвтрэх',
      message: 'Дараагийн удаа нууц үг оруулахгүйгээр хурууны хээ эсвэл '
          'царайгаараа нэвтрэх боломжтой. Одоо тохируулах уу?',
      confirmLabel: 'Тохируулах',
      cancelLabel: 'Дараа',
    );
    if (!accepted) return;
    await auth.setBiometricEnabled(true);
  }

  Future<void> _unlockWithBiometrics() async {
    final auth = context.read<AuthController>();
    final ok = await auth.unlockWithBiometrics();
    if (!mounted || ok) return;
    AppSnack.error(context, auth.lastError ?? 'Таних амжилтгүй боллоо.');
  }

  void _openForgotPassword() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ForgotPasswordScreen(
          userName: _userName.text.trim(),
          role: _role,
        ),
      ),
    );
  }

  /// QA-д зориулсан серверийн хаягийн тохиргоо. Release билд дээр нээгдэхгүй.
  void _openServerSettings() {
    if (!AppConfig.canOverrideBaseUrl) return;
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const ServerSettingsSheet(),
    );
  }
}

/// Эмч / үйлчлүүлэгч нэвтрэх хэсгийн сонголт.
///
/// Хоёр хэсэг нь backend дээр өөр өөр endpoint, өөр эрхийн хаалгатай тул
/// сонголт нь зөвхөн харагдац биш — аль зам руу нэвтрэхийг тодорхойлно.
class _RoleSelector extends StatelessWidget {
  const _RoleSelector({required this.value, required this.onChanged});

  final LoginRole value;
  final ValueChanged<LoginRole> onChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.6),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: <Widget>[
          for (final role in LoginRole.values)
            Expanded(
              child: _RoleTab(
                label: role.label,
                icon: role == LoginRole.doctor
                    ? Icons.medical_services_outlined
                    : Icons.person_outline_rounded,
                selected: value == role,
                onTap: () => onChanged(role),
              ),
            ),
        ],
      ),
    );
  }
}

class _RoleTab extends StatelessWidget {
  const _RoleTab({
    required this.label,
    required this.icon,
    required this.selected,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(11),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 160),
        padding: const EdgeInsets.symmetric(vertical: 11),
        decoration: BoxDecoration(
          color: selected ? theme.colorScheme.surface : Colors.transparent,
          borderRadius: BorderRadius.circular(11),
          border: Border.all(
            color: selected ? theme.dividerColor : Colors.transparent,
          ),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(
              icon,
              size: 18,
              color: selected
                  ? theme.colorScheme.primary
                  : theme.colorScheme.onSurfaceVariant,
            ),
            const SizedBox(width: 8),
            Text(
              label,
              style: theme.textTheme.labelLarge?.copyWith(
                color: selected
                    ? theme.colorScheme.primary
                    : theme.colorScheme.onSurfaceVariant,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _Brand extends StatelessWidget {
  const _Brand({required this.onLongPress});

  final VoidCallback onLongPress;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      // Урт дарах нь зөвхөн хөгжүүлэлт/туршилтын билд дээр серверийн хаягийн
      // цонхыг нээнэ.
      onLongPress: onLongPress,
      child: Column(
        children: <Widget>[
          // Системийн албан ёсны лого — вебийн `frontend/public/logo.ico`
          // (`assets/logo.png`). Тунгалаг дэвсгэртэй тул цагаан дэлгэц дээр
          // шууд сууна; хавтан, градиент хэрэггүй.
          Image.asset(
            'assets/logo.png',
            width: 112,
            height: 112,
            filterQuality: FilterQuality.high,
            semanticLabel: 'МнКардио',
          ),
          const SizedBox(height: 16),
          Text(
            'МнКардио',
            style: theme.textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.w800,
              letterSpacing: 0.2,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Зүрх судасны үндэсний төв',
            style: theme.textTheme.bodySmall,
          ),
        ],
      ),
    );
  }
}

/// Техникийн шаардлага §36 — 3 удаа буруу оруулсны дараа анхааруулах.
///
/// Сервер тал буруу оролдлогыг тоолдоггүй, бүртгэлийг түгждэггүй тул энэ нь
/// зөвхөн **төхөөрөмж дээрх сануулга**. Аюулгүй байдлын хамгаалалт биш —
/// жинхэнэ түгжээ нь өгөгдлийн сангийн тоолуур шаардана (READINESS.md §3).
class _AttemptWarning extends StatelessWidget {
  const _AttemptWarning({required this.attempts});

  final int attempts;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: AppColors.warningLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.warning.withValues(alpha: 0.35)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const Icon(Icons.warning_amber_rounded,
              size: 20, color: AppColors.warning),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              'Та $attempts удаа буруу нууц үг оруулсан байна. '
              'Нууц үгээ мартсан бол "Нууц үгээ мартсан уу?" хэсгээр '
              'сэргээнэ үү.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: const Color(0xFF6B4E00),
                height: 1.45,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
