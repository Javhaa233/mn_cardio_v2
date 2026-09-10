import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/network/api_exception.dart';
import '../../core/util/validators.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/state_views.dart';
import 'reset_password_screen.dart';

/// Техникийн шаардлага §1.2.5 — "Хэрэглэгч нууц үгээ мартсан тохиолдолд
/// админы дэмжлэггүйгээр сэргээх боломжтой байх".
class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({
    super.key,
    this.userName = '',
    this.role = LoginRole.patient,
  });

  final String userName;

  /// Эмч, үйлчлүүлэгч хоёр өөр endpoint-той тул дамжуулна.
  final LoginRole role;

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  late final TextEditingController _userName =
      TextEditingController(text: widget.userName);

  bool _sending = false;
  String? _sentMessage;

  @override
  void dispose() {
    _userName.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Нууц үг сэргээх')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              if (_sentMessage != null) ...<Widget>[
                _SentNotice(message: _sentMessage!),
                const SizedBox(height: 20),
                FilledButton.icon(
                  onPressed: _openReset,
                  icon: const Icon(Icons.password_rounded),
                  label: const Text('Сэргээх код оруулах'),
                ),
                const SizedBox(height: 12),
                OutlinedButton(
                  onPressed: _sending ? null : _send,
                  child: const Text('Дахин илгээх'),
                ),
              ] else ...<Widget>[
                Text(
                  'Бүртгэлтэй нэвтрэх нэрээ оруулна уу. Таны бүртгэлд '
                  'холбогдсон имэйл рүү нууц үг сэргээх заавар илгээгдэнэ.',
                  style: theme.textTheme.bodyMedium,
                ),
                const SizedBox(height: 22),
                TextFormField(
                  controller: _userName,
                  autocorrect: false,
                  enableSuggestions: false,
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _send(),
                  decoration: const InputDecoration(
                    labelText: 'Нэвтрэх нэр',
                    prefixIcon: Icon(Icons.person_outline_rounded),
                  ),
                  validator: Validators.userName,
                ),
                const SizedBox(height: 20),
                FilledButton(
                  onPressed: _sending ? null : _send,
                  child: _sending
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.4,
                            color: Colors.white,
                          ),
                        )
                      : const Text('Заавар илгээх'),
                ),
                const SizedBox(height: 14),
                TextButton(
                  onPressed: _openReset,
                  child: const Text('Сэргээх код аль хэдийн авсан'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _send() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    setState(() => _sending = true);
    try {
      final message =
          await context.read<AuthController>().forgotPassword(
                _userName.text,
                role: widget.role,
              );
      if (!mounted) return;
      setState(() => _sentMessage = message);
    } on ApiException catch (e) {
      if (!mounted) return;
      AppSnack.error(context, e.message);
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  void _openReset() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ResetPasswordScreen(
          userName: _userName.text.trim(),
          role: widget.role,
        ),
      ),
    );
  }
}

class _SentNotice extends StatelessWidget {
  const _SentNotice({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        const SizedBox(height: 12),
        EmptyView(
          title: 'Заавар илгээгдлээ',
          message: message,
          icon: Icons.mark_email_read_outlined,
        ),
      ],
    );
  }
}
