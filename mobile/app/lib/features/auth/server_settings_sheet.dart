import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/config/app_config.dart';
import '../../shared/widgets/app_snack.dart';

/// Туршилтын орчинд серверийн хаяг солих цонх.
///
/// **Release билд дээр огт нээгдэхгүй.** Үйлдвэрлэлийн апп зөвхөн билдэд
/// шигтгэсэн хаягаар ажиллана — өөрөөр бол хэрэглэгчийн эмнэлгийн өгөгдлийг
/// хэн нэгний зааж өгсөн сервер рүү илгээх боломж үүснэ.
///
/// Утас эсвэл эмулятор `localhost` руу хандахгүй: Android эмулятор хостыг
/// `10.0.2.2` гэж хардаг, бодит төхөөрөмж LAN IP шаардана.
class ServerSettingsSheet extends StatefulWidget {
  const ServerSettingsSheet({super.key});

  @override
  State<ServerSettingsSheet> createState() => _ServerSettingsSheetState();
}

class _ServerSettingsSheetState extends State<ServerSettingsSheet> {
  late final TextEditingController _url =
      TextEditingController(text: AppConfig.runtimeOverride ?? '');

  @override
  void dispose() {
    _url.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (!AppConfig.canOverrideBaseUrl) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: EdgeInsets.only(bottom: MediaQuery.viewInsetsOf(context).bottom),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Text('Серверийн хаяг', style: theme.textTheme.titleMedium),
              const SizedBox(height: 6),
              Text(
                'Зөвхөн туршилтын билд дээр ажиллана.\n'
                'Одоогийн хаяг: ${AppConfig.baseUrl}',
                style: theme.textTheme.bodySmall,
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _url,
                autocorrect: false,
                keyboardType: TextInputType.url,
                decoration: InputDecoration(
                  labelText: 'Хаяг',
                  hintText: AppConfig.testServerUrl,
                  helperText: 'Локал backend: ${AppConfig.localDevSuggestion} · '
                      'Бодит утас локал сервер рүү холбогдоход компьютерийн '
                      'LAN IP хэрэгтэй',
                  helperMaxLines: 3,
                ),
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                children: <Widget>[
                  ActionChip(
                    avatar: const Icon(Icons.cloud_outlined, size: 17),
                    label: const Text('Туршилтын сервер'),
                    onPressed: () =>
                        _url.text = AppConfig.testServerUrl,
                  ),
                  ActionChip(
                    avatar: const Icon(Icons.computer_outlined, size: 17),
                    label: const Text('Локал backend'),
                    onPressed: () =>
                        _url.text = AppConfig.localDevSuggestion,
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: <Widget>[
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => _apply(null),
                      child: const Text('Анхны утга'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: FilledButton(
                      onPressed: () => _apply(_url.text),
                      child: const Text('Хадгалах'),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _apply(String? value) async {
    final navigator = Navigator.of(context);
    final messenger = ScaffoldMessenger.of(context);
    await context.read<AuthController>().setBaseUrlOverride(value);
    navigator.pop();
    AppSnack.infoOn(messenger, 'Серверийн хаяг: ${AppConfig.baseUrl}');
  }
}
