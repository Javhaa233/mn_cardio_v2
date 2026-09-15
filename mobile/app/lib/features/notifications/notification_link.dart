import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../advice/advice_screen.dart';
import '../doctor/doctor_advice_screen.dart';
import '../doctor/doctor_evisits_screen.dart';
import '../doctor/doctor_monitoring_screen.dart';
import '../doctor/doctor_repository.dart';
import '../doctor/ticket_detail_screen.dart';
import '../evisits/evisits_screen.dart';
import '../questions/questions_screen.dart';
import '../reminders/reminders_screen.dart';
import '../../shared/widgets/app_snack.dart';
import 'notifications_controller.dart';

/// Мэдэгдэл дээр дарахад холбогдох хэсэг рүү шилжүүлнэ.
///
/// Сервер `LinkObjectName` ба `LinkObjectId` хоёрыг өгдөг (API.md §2.8).
/// Хаашаа очих нь **хэн харж байгаагаас** хамаарна: ижил `VisitComments`
/// мөр үйлчлүүлэгчид өөрийн асуултын урсгал, эмчид тухайн үйлчлүүлэгчтэй
/// хийсэн харилцаа болно.
Future<void> openNotification(
  BuildContext context,
  AppNotification item, {
  required bool isDoctor,
}) async {
  final object = (item.linkObjectName ?? '').trim();
  final id = item.linkObjectId ?? 0;

  Future<void> push(Widget screen) async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => screen),
    );
  }

  if (!isDoctor) {
    switch (object) {
      case 'VisitComments':
        return push(const QuestionsScreen());
      case 'RemoteVisit':
        return push(const EvisitsScreen());
      case 'Advice':
      case 'AdviceComment':
        return push(const AdviceScreen());
      default:
        // Сануулга нь мэдэгдэл хэлбэрээр ирдэг (Action: 'Reminder').
        if (item.action == 'Reminder') return push(const RemindersScreen());
        AppSnack.info(context, 'Энэ мэдэгдэлд нээх хэсэг алга.');
        return;
    }
  }

  switch (object) {
    case 'RemoteVisit':
      return push(const DoctorEvisitsScreen());

    case 'Advice':
      // Асуумжийг дугаараар нь татаад шууд нээнэ.
      if (id > 0) {
        final ticket = await context.read<DoctorRepository>().fetchTicket(id);
        if (!context.mounted) return;
        if (ticket != null) return push(TicketDetailScreen(ticket: ticket));
      }
      if (!context.mounted) return;
      return push(const DoctorAdviceScreen());

    case 'AdviceComment':
      // Сэтгэгдлийн дугаараар асуумжийг олох зам серверт байхгүй тул
      // өөрийн асуумжуудын жагсаалт руу аваачна.
      return push(const DoctorAdviceScreen());

    case 'VisitComments':
      // Сервер асуултын мөрийн дугаарыг өгдөг ч аль үйлчлүүлэгчийнх нь
      // мэдэгддэггүй. Хяналтын жагсаалтаас сонгоно — BACKEND-ENDPOINTS-д
      // бүртгэсэн (мэдэгдэлд `PatientId` нэмэх).
      return push(const DoctorMonitoringScreen());

    default:
      AppSnack.info(context, 'Энэ мэдэгдэлд нээх хэсэг алга.');
      return;
  }
}
