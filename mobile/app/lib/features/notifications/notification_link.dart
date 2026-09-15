import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../access_log/access_log_screen.dart';
import '../advice/advice_screen.dart';
import '../consents/consents_screen.dart';
import '../doctor/doctor_advice_screen.dart';
import '../doctor/doctor_evisits_screen.dart';
import '../doctor/doctor_monitoring_screen.dart';
import '../doctor/doctor_repository.dart';
import '../doctor/ticket_detail_screen.dart';
import '../evisits/evisits_screen.dart';
import '../questions/questions_screen.dart';
import '../rehab/rehab_screen.dart';
import '../reminders/reminders_screen.dart';
import 'notification_router.dart';
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
  final action = (item.action ?? '').trim();
  final id = item.linkObjectId ?? 0;

  Future<void> push(Widget screen) async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => screen),
    );
  }

  // Чатын мэдэгдэл эмч, үйлчлүүлэгч хоёуланд ижил: өрөө рүү нь оруулна.
  // Сервер өрөө тус бүрд НЭГ мөр бичдэг — шинэ мессеж ирэх бүрд түүнийгээ
  // дарж бичдэг тул жагсаалт мессеж болгоноор дүүрэхгүй (API.md §2.8).
  if (object == 'ChatRoom') {
    if (id > 0) return openChatRoomById(context, id);
    return;
  }

  // Хандалтын мэдэгдэл нь ямар ч бичлэгийн нэрээр ирж болно (Visit, Patient,
  // шинжилгээ …) тул нэрээр нь биш, үйлдлээр нь таана.
  if (action == 'RecordAccessed') {
    if (!isDoctor) return push(const AccessLogScreen());
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
      case 'RehabAssessment':
        return push(const RehabScreen());
      case 'PatientConsent':
        return push(const ConsentsScreen());
      case 'Patient':
        return push(const AccessLogScreen());
      default:
        // Сануулга нь мэдэгдэл хэлбэрээр ирдэг (Action: 'Reminder').
        if (action == 'Reminder') return push(const RemindersScreen());
        _showText(context, item);
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

    case 'PatientMonitoringDoctor':
    case 'RehabAssessment':
      return push(const DoctorMonitoringScreen());

    default:
      _showText(context, item);
      return;
  }
}

/// Хаашаа очихыг мэдэхгүй мэдэгдлийн **агуулгыг** харуулна.
///
/// "Нээх хэсэг алга" гэдэг нь хэрэглэгчид юу ч хэлэхгүй. Мэдэгдэл өөрөө
/// мэдээлэл тул наад зах нь түүнийг нь бүтнээр нь уншуулна.
void _showText(BuildContext context, AppNotification item) {
  showDialog<void>(
    context: context,
    builder: (BuildContext ctx) => AlertDialog(
      title: const Text('Мэдэгдэл'),
      content: Text(item.text, style: const TextStyle(height: 1.45)),
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.of(ctx).pop(),
          child: const Text('Хаах'),
        ),
      ],
    ),
  );
}
