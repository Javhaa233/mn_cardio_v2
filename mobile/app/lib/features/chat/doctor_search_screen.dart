import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_exception.dart';
import '../../shared/widgets/app_snack.dart';
import 'chat_controller.dart';
import 'chat_models.dart';
import 'chat_room_screen.dart';
import 'doctor_picker.dart';

/// Эмчийн нүүр хуудасны "Эмч хайх" картаас нээгдэх жагсаалт.
///
/// Картанд сонгосон аймаг, сум, хайлтын үгтэйгээр нээгдэж, эмчийг сонгоход
/// ганцаарчилсан яриа шууд эхэлнэ — вебийн "Ганцаарчилсан" таб шиг, хоёр дахь
/// алхамгүй. Шүүлтүүрийг энд ч үргэлжлүүлэн өөрчилж болно.
class DoctorSearchScreen extends StatefulWidget {
  const DoctorSearchScreen({
    super.key,
    this.initialProvince,
    this.initialSoum,
    this.initialSearch = '',
  });

  final String? initialProvince;
  final String? initialSoum;
  final String initialSearch;

  @override
  State<DoctorSearchScreen> createState() => _DoctorSearchScreenState();
}

class _DoctorSearchScreenState extends State<DoctorSearchScreen> {
  bool _busy = false;

  Future<void> _startChat(DirectoryPerson person) async {
    if (_busy) return;
    setState(() => _busy = true);

    final rooms = context.read<ChatRoomsController>();
    final navigator = Navigator.of(context);
    try {
      final roomId = await rooms.startChat(person);
      if (!mounted) return;

      ChatRoom? room;
      for (final ChatRoom r in rooms.rooms) {
        if (r.chatRoomId == roomId) {
          room = r;
          break;
        }
      }
      // Жагсаалт руу буцахад дахин нэг чат нээгдэхээс сэргийлж солино.
      unawaited(navigator.pushReplacement(
        MaterialPageRoute<void>(
          builder: (_) => ChatRoomScreen(
            room: room ??
                ChatRoom(
                  chatRoomId: roomId,
                  name: person.name,
                  roomType: 'DR',
                ),
            me: rooms.me,
          ),
        ),
      ));
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Эмч хайх'),
        bottom: _busy
            ? const PreferredSize(
                preferredSize: Size.fromHeight(2),
                child: LinearProgressIndicator(minHeight: 2),
              )
            : null,
      ),
      body: DoctorPicker(
        onPick: _startChat,
        initialProvince: widget.initialProvince,
        initialSoum: widget.initialSoum,
        initialSearch: widget.initialSearch,
      ),
    );
  }
}
