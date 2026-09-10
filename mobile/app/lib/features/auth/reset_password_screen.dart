import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/network/api_exception.dart';
import '../../core/util/validators.dart';
import '../../shared/widgets/app_snack.dart';

/// Имэйлээр ирсэн кодоор шинэ нууц үг тогтоох.
class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({
    super.key,
    this.userName = '',
    this.role = LoginRole.patient,
  });

  final String userName;

  /// Эмч, үйлчлүүлэгч хоёр өөр endpoint-той тул дамжуулна.
  final LoginRole role;

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  late final TextEditingController _userName =
      TextEditingController(text: widget.userName);
  final TextEditingController _token = TextEditingController();
  final TextEditingController _password = TextEditingController();
  final TextEditingController _confirm = TextEditingController();

  bool _obscure = true;
  bool _saving = false;

  @override
  void dispose() {
    _userName.dispose();
    _token.dispose();
    _password.dispose();
    _confirm.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Шинэ нууц үг')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(24, 24, 24, 32),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Text(
                'Имэйлээр ирсэн сэргээх кодоо оруулаад шинэ нууц үгээ '
                'тогтооно уу.',
                style: theme.textTheme.bodyMedium,
              ),
              const SizedBox(height: 22),
              TextFormField(
                controller: _userName,
                autocorrect: false,
                enableSuggestions: false,
                decoration: const InputDecoration(
                  labelText: 'Нэвтрэх нэр',
                  prefixIcon: Icon(Icons.person_outline_rounded),
                ),
                validator: Validators.userName,
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _token,
                autocorrect: false,
                enableSuggestions: false,
                decoration: const InputDecoration(
                  labelText: 'Сэргээх код',
                  prefixIcon: Icon(Icons.vpn_key_outlined),
                ),
                validator: (String? v) =>
                    Validators.required(v, field: 'Сэргээх код'),
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _password,
                obscureText: _obscure,
                autocorrect: false,
                enableSuggestions: false,
                decoration: InputDecoration(
                  labelText: 'Шинэ нууц үг',
                  prefixIcon: const Icon(Icons.lock_outline_rounded),
                  helperText: Validators.passwordRequirementHint,
                  helperMaxLines: 3,
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
                validator: Validators.newPassword,
              ),
              const SizedBox(height: 14),
              TextFormField(
                controller: _confirm,
                obscureText: _obscure,
                autocorrect: false,
                enableSuggestions: false,
                decoration: const InputDecoration(
                  labelText: 'Шинэ нууц үг давтах',
                  prefixIcon: Icon(Icons.lock_reset_rounded),
                ),
                validator: (String? v) =>
                    Validators.confirmPassword(v, _password.text),
              ),
              const SizedBox(height: 22),
              FilledButton(
                onPressed: _saving ? null : _submit,
                child: _saving
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.4,
                          color: Colors.white,
                        ),
                      )
                    : const Text('Нууц үг шинэчлэх'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _submit() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;

    // Маршрут хаагдсаны дараа мэдэгдэл харуулна.
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);

    setState(() => _saving = true);
    try {
      final message = await context.read<AuthController>().resetPassword(
            userName: _userName.text,
            token: _token.text,
            password: _password.text,
            role: widget.role,
          );
      if (!mounted) return;
      // Нууц үг сэргээх дэлгэц ба түүний өмнөх дэлгэцийг хаана.
      navigator
        ..pop()
        ..pop();
      AppSnack.successOn(messenger, message);
    } on ApiException catch (e) {
      if (!mounted) return;
      AppSnack.error(context, e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }
}
