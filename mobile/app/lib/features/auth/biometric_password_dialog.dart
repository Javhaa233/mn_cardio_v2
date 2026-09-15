import 'package:flutter/material.dart';

/// Биометрийг асаахад нууц үгийг нэг удаа асууна.
///
/// Гарсны дараа ч хурууны хээгээр нэвтрэх бол апп нэвтрэх мэдээллийг
/// төхөөрөмжийн хамгаалагдсан хадгалалтад (Keychain / Keystore) үлдээх ёстой:
/// токен гарахад устдаг тул сэргээх зүйл үлдэхгүй. Хэрэглэгч апп нээснээс
/// хойш нэвтрээгүй бол нууц үг санах ойд байхгүй — иймд энд асууна.
Future<String?> askBiometricPassword(BuildContext context) {
  final controller = TextEditingController();
  var obscure = true;

  return showDialog<String>(
    context: context,
    builder: (BuildContext ctx) => StatefulBuilder(
      builder: (BuildContext ctx, void Function(void Function()) setState) =>
          AlertDialog(
        title: const Text('Хурууны хээгээр нэвтрэх'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            const Text(
              'Системээс гарсны дараа ч хурууны хээгээр нэвтрэхийн тулд '
              'нууц үгээ нэг удаа баталгаажуулна уу. Нууц үг зөвхөн энэ '
              'төхөөрөмжийн хамгаалагдсан хадгалалтад үлдэх бөгөөд хурууны '
              'хээ таньсны дараа л уншигдана.',
              style: TextStyle(height: 1.45),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: controller,
              obscureText: obscure,
              autofocus: true,
              decoration: InputDecoration(
                labelText: 'Нууц үг',
                suffixIcon: IconButton(
                  onPressed: () => setState(() => obscure = !obscure),
                  icon: Icon(
                    obscure
                        ? Icons.visibility_outlined
                        : Icons.visibility_off_outlined,
                  ),
                ),
              ),
            ),
          ],
        ),
        actions: <Widget>[
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(),
            child: const Text('Болих'),
          ),
          FilledButton(
            onPressed: () => Navigator.of(ctx).pop(controller.text),
            child: const Text('Хадгалах'),
          ),
        ],
      ),
    ),
  );
}
