import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';

/// Апп нээгдэхэд биометрээр түгжээ тайлах дэлгэц.
///
/// Хурууны хээ төхөөрөмжөөс **хэзээ ч гардаггүй**: энэ нь Keystore/Keychain
/// дотор хадгалсан токеныг онгойлгох түлхүүр л болно. Серверт биометрийн
/// endpoint байхгүй бөгөөд байх шаардлагагүй (FLUTTER.md § "Biometric login").
class BiometricGateScreen extends StatefulWidget {
  const BiometricGateScreen({super.key});

  @override
  State<BiometricGateScreen> createState() => _BiometricGateScreenState();
}

class _BiometricGateScreenState extends State<BiometricGateScreen> {
  @override
  void initState() {
    super.initState();
    // Дэлгэц нээгдмэгц шууд асууна — хэрэглэгч нэмэлт товч дарах шаардлагагүй.
    WidgetsBinding.instance.addPostFrameCallback((_) => _unlock());
  }

  Future<void> _unlock() async {
    await context.read<AuthController>().unlockWithBiometrics();
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthController>();
    final theme = Theme.of(context);
    final name = auth.user?.displayName ?? auth.lastUserName;

    return Scaffold(
      body: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                Container(
                  width: 84,
                  height: 84,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withValues(alpha: 0.10),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.fingerprint_rounded,
                    size: 44,
                    color: theme.colorScheme.primary,
                  ),
                ),
                const SizedBox(height: 26),
                Text(
                  'МнКардио түгжээтэй байна',
                  style: theme.textTheme.titleLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  name == null || name.isEmpty
                      ? 'Үргэлжлүүлэхийн тулд таниулна уу.'
                      : '$name — үргэлжлүүлэхийн тулд таниулна уу.',
                  style: theme.textTheme.bodySmall,
                  textAlign: TextAlign.center,
                ),
                if (auth.lastError != null) ...<Widget>[
                  const SizedBox(height: 14),
                  Text(
                    auth.lastError!,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.error,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
                const SizedBox(height: 32),
                SizedBox(
                  width: 260,
                  child: FilledButton.icon(
                    onPressed: auth.busy ? null : _unlock,
                    icon: const Icon(Icons.lock_open_rounded),
                    label: const Text('Түгжээ тайлах'),
                  ),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: auth.busy
                      ? null
                      : () => context.read<AuthController>().fallbackToPassword(),
                  child: const Text('Нууц үгээр нэвтрэх'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
