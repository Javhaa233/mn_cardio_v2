import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/auth/auth_controller.dart';
import '../../core/network/api_exception.dart';
import '../../shared/widgets/app_snack.dart';
import 'chat_controller.dart';
import 'chat_models.dart';
import 'doctor_picker.dart';

/// Шинэ яриа — вебийн `customComponents/Chat/NewChatDialog.jsx`.
///
/// Эмчид хоёр хэсэг: **Ганцаарчилсан** — эмч сонгоход яриа шууд эхэлнэ, хоёр
/// дахь алхамгүй; **Бүлэг** — нэр өгч, олон эмч сонгоод үүсгэнэ.
///
/// Үйлчлүүлэгчид бүлгийн хэсэг огт харагдахгүй: тэр зөвхөн өөрийн эмчтэй 1:1
/// ярих эрхтэй, сервер бүлгийг ямар ч байсан татгалзана.
///
/// Амжилттай бол өрөөний дугаарыг буцааж хаагдана; дуудагч өрөөг нээнэ.
class NewChatScreen extends StatefulWidget {
  const NewChatScreen({super.key, this.initialTab = 0});

  /// 0 — Ганцаарчилсан, 1 — Бүлэг.
  final int initialTab;

  @override
  State<NewChatScreen> createState() => _NewChatScreenState();
}

class _NewChatScreenState extends State<NewChatScreen> {
  final TextEditingController _groupName = TextEditingController();
  final List<DirectoryPerson> _members = <DirectoryPerson>[];
  bool _busy = false;

  @override
  void dispose() {
    _groupName.dispose();
    super.dispose();
  }

  Future<void> _startDirect(DirectoryPerson person) async {
    if (_busy) return;
    setState(() => _busy = true);
    try {
      final roomId =
          await context.read<ChatRoomsController>().startChat(person);
      if (!mounted) return;
      Navigator.of(context).pop(roomId);
    } on ApiException catch (e) {
      _failed(e.message);
    } catch (_) {
      _failed('Алдаа гарлаа. Дахин оролдоно уу.');
    }
  }

  void _toggleMember(DirectoryPerson person) {
    setState(() {
      final index =
          _members.indexWhere((DirectoryPerson m) => m.key == person.key);
      if (index == -1) {
        _members.add(person);
      } else {
        _members.removeAt(index);
      }
    });
  }

  bool get _canCreate =>
      !_busy && _groupName.text.trim().isNotEmpty && _members.isNotEmpty;

  Future<void> _createGroup() async {
    if (!_canCreate) return;
    setState(() => _busy = true);
    // Snackbar нь хаагдсаны дараа чатын жагсаалт дээр харагдах ёстой.
    final messenger = ScaffoldMessenger.of(context);
    try {
      final roomId = await context
          .read<ChatRoomsController>()
          .createGroup(_groupName.text.trim(), List<DirectoryPerson>.of(_members));
      if (!mounted) return;
      Navigator.of(context).pop(roomId);
      AppSnack.successOn(messenger, 'Бүлгийн чат үүсгэлээ');
    } on ApiException catch (e) {
      _failed(e.message);
    } catch (_) {
      _failed('Алдаа гарлаа. Дахин оролдоно уу.');
    }
  }

  void _failed(String message) {
    if (!mounted) return;
    setState(() => _busy = false);
    AppSnack.error(context, message);
  }

  @override
  Widget build(BuildContext context) {
    final isDoctor = context.watch<AuthController>().isDoctorSession;

    if (!isDoctor) {
      return Scaffold(
        appBar: AppBar(title: const Text('Эмч хайх')),
        body: _withProgress(_buildDirect(patient: true)),
      );
    }

    return DefaultTabController(
      length: 2,
      initialIndex: widget.initialTab.clamp(0, 1),
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Шинэ яриа'),
          bottom: const TabBar(
            tabs: <Widget>[
              Tab(text: 'Ганцаарчилсан'),
              Tab(text: 'Бүлэг'),
            ],
          ),
        ),
        body: _withProgress(
          TabBarView(
            children: <Widget>[
              _buildDirect(patient: false),
              _buildGroup(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _withProgress(Widget child) {
    return Column(
      children: <Widget>[
        if (_busy) const LinearProgressIndicator(minHeight: 2),
        Expanded(child: child),
      ],
    );
  }

  Widget _buildDirect({required bool patient}) {
    final theme = Theme.of(context);
    return Column(
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Align(
            alignment: Alignment.centerLeft,
            child: Text(
              patient
                  ? 'Өөрийн эмчийг сонгоно уу'
                  : 'Эмчийг сонгоход яриа шууд эхэлнэ',
              style: theme.textTheme.bodySmall,
            ),
          ),
        ),
        Expanded(child: DoctorPicker(onPick: _startDirect)),
      ],
    );
  }

  Widget _buildGroup() {
    return Column(
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              TextField(
                controller: _groupName,
                textCapitalization: TextCapitalization.sentences,
                onChanged: (_) => setState(() {}),
                decoration: const InputDecoration(labelText: 'Бүлгийн нэр'),
              ),
              if (_members.isNotEmpty) ...<Widget>[
                const SizedBox(height: 10),
                // Олон хүн сонгоход жагсаалтыг түлхэж гаргахгүйн тулд өндрийг
                // хязгаарлав.
                ConstrainedBox(
                  constraints: const BoxConstraints(maxHeight: 96),
                  child: SingleChildScrollView(
                    child: Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: <Widget>[
                        for (final DirectoryPerson m in _members)
                          InputChip(
                            label: Text(m.name),
                            onDeleted: () => _toggleMember(m),
                          ),
                      ],
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
        Expanded(
          child: DoctorPicker(
            multiple: true,
            selected: <String>{
              for (final DirectoryPerson m in _members) m.key,
            },
            onPick: _toggleMember,
          ),
        ),
        SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 12),
            child: FilledButton(
              onPressed: _canCreate ? _createGroup : null,
              child: Text('Бүлэг үүсгэх (${_members.length})'),
            ),
          ),
        ),
      ],
    );
  }
}
