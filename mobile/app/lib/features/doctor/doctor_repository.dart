import 'dart:convert';
import 'dart:io';

import 'package:dio/dio.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import '../../shared/widgets/date_range_field.dart';
import 'doctor_models.dart';

/// Үзлэгийн жагсаалтын хамрах хүрээ.
enum VisitScope {
  /// Энэ хэрэглэгчийн өөрийн бүртгэсэн үзлэг (анхдагч).
  mine,

  /// Байгууллага бүхэлдээ, харьяа салбаруудыг оруулаад.
  organization;

  String get label =>
      this == VisitScope.mine ? 'Миний үзлэг' : 'Байгууллагын';
}

/// Зөвлөгөөний шүүлтүүр.
enum AdviceFilter {
  mine,
  drafts,
  all;

  String get label => switch (this) {
        AdviceFilter.mine => 'Нийтэлсэн',
        AdviceFilter.drafts => 'Ноорог',
        AdviceFilter.all => 'Бүгд',
      };
}

/// Эмчийн модулийн бүх дуудлага — `/api/doctor/*`.
///
/// Үйлчлүүлэгчийн гадаргуутай ижил дүрэмтэй: жинхэнэ verb, жинхэнэ статус код,
/// жижиг үсгийн дугтуй. **Ямар ч endpoint эмч, хэрэглэгч, байгууллагын
/// танигч хүлээж авдаггүй** — гурвуулаа токеноос гарна. Энэ нь нэг эмч нөгөө
/// эмчийн ачааллыг хүсэлтийн бие засаж уншихаас сэргийлдэг (API.md §4).
/// Нүүр хуудасны тасалбарын шүүлтүүр — вебийн `AdviceFeed/FilterBar.jsx`,
/// серверийн `BuildTabWhere`.
enum FeedFilter {
  all('all', 'Бүгд'),
  open('open', 'Нээлттэй'),
  closed('closed', 'Хаагдсан'),
  mine('mine', 'Миний'),
  drafts('drafts', 'Миний ноорог');

  const FeedFilter(this.apiValue, this.label);

  final String apiValue;
  final String label;
}

class DoctorRepository {
  DoctorRepository(this._api);

  final ApiClient _api;

  // ------------------------------------------------------------------
  // Профайл
  // ------------------------------------------------------------------

  Future<DoctorMe> fetchMe() async {
    final data = await _api.getObject('/api/doctor/me');
    return DoctorMe.fromJson(data);
  }

  // ------------------------------------------------------------------
  // 1.1 Миний үзлэгүүд
  // ------------------------------------------------------------------

  Future<Paged<DoctorVisit>> fetchVisits({
    required int limit,
    required int offset,
    VisitScope scope = VisitScope.mine,
    DateRange range = DateRange.all,
    String search = '',
  }) {
    return _api.getPaged<DoctorVisit>(
      '/api/doctor/visits',
      DoctorVisit.fromJson,
      limit: limit,
      offset: offset,
      query: <String, dynamic>{
        'scope': scope.name,
        ...range.toQuery(),
        if (search.trim().isNotEmpty) 'search': search.trim(),
      },
    );
  }

  /// Нэг үзлэгийн бүрэн бичлэг.
  ///
  /// Байгууллагаас гадуурх дугаар **404 буцаана** — бичлэгийг биш. Энэ нь
  /// ~450,000 үзлэгийн дугаарыг дараалан оролдох боломжийг хаадаг.
  Future<Map<String, dynamic>> fetchVisitRaw(int id) =>
      _api.getObject('/api/doctor/visits/$id');

  // ------------------------------------------------------------------
  // 1.2 Миний хяналт
  // ------------------------------------------------------------------

  Future<Paged<MonitoringRow>> fetchMonitoring({
    required int limit,
    required int offset,
  }) {
    return _api.getPaged<MonitoringRow>(
      '/api/doctor/monitoring',
      MonitoringRow.fromJson,
      limit: limit,
      offset: offset,
    );
  }

  /// Үйлчлүүлэгчийг хувийн хяналтад авах.
  ///
  /// Эмчийг **токеноос** авна. Хуучин дүйцэх зам
  /// (`/api/PatientMonitoring/SavePatient`) нь `UserId`, `DoctorId`-г
  /// хүсэлтийн биеэс уншдаг тул өөр эмчийн жагсаалт руу чиглүүлж болдог —
  /// түүнийг хэрэглэхгүй.
  Future<void> addMonitoring(int patientId) async {
    await _api.postObject(
      '/api/doctor/monitoring',
      body: <String, dynamic>{'PatientId': patientId},
    );
  }

  Future<void> removeMonitoring(int patientId) =>
      _api.delete('/api/doctor/monitoring/$patientId');

  /// Хяналтад буй үйлчлүүлэгчийн тэмдэглэл.
  ///
  /// Хяналтад байхгүй үйлчлүүлэгчийг `403 NOT_MONITORED` гэж татгалзана.
  Future<PatientJournalBundle> fetchMonitoringJournal(
    int patientId, {
    DateRange range = DateRange.all,
  }) async {
    final data = await _api.getRaw(
      '/api/doctor/monitoring/$patientId/journal',
      query: range.toQuery(),
    );
    if (data is! Map) return PatientJournalBundle.empty;
    return PatientJournalBundle.fromJson(Map<String, dynamic>.from(data));
  }

  // ------------------------------------------------------------------
  // 1.3 Миний зөвлөгөө
  // ------------------------------------------------------------------

  Future<Paged<DoctorAdvice>> fetchAdvice({
    required int limit,
    required int offset,
    AdviceFilter filter = AdviceFilter.mine,
  }) {
    return _api.getPaged<DoctorAdvice>(
      '/api/doctor/advice',
      DoctorAdvice.fromJson,
      limit: limit,
      offset: offset,
      query: <String, dynamic>{'filter': filter.name},
    );
  }

  Future<DoctorAdviceDetail> fetchAdviceDetail(int id) async {
    final data = await _api.getObject('/api/doctor/advice/$id');
    return DoctorAdviceDetail.fromJson(data);
  }

  // ------------------------------------------------------------------
  // 1.4 Миний тайлан
  // ------------------------------------------------------------------

  Future<DoctorReport> fetchReport({DateRange range = DateRange.all}) async {
    final data = await _api.getObject(
      '/api/doctor/reports/summary',
      query: range.toQuery(),
    );
    return DoctorReport.fromJson(data);
  }

  // ------------------------------------------------------------------
  // 1.5 Үйлчлүүлэгчийн мэдээлэл харах
  // ------------------------------------------------------------------

  /// Регистрийн дугаар эсвэл нэрээр хайх. **3-аас доошгүй тэмдэгт** —
  /// эс бөгөөс сервер `400 SEARCH_TOO_SHORT` буцаана.
  Future<Paged<PatientBrief>> searchPatients({
    required String search,
    required int limit,
    required int offset,
  }) {
    return _api.getPaged<PatientBrief>(
      '/api/doctor/patients',
      PatientBrief.fromJson,
      limit: limit,
      offset: offset,
      query: <String, dynamic>{'search': search.trim()},
    );
  }

  // ------------------------------------------------------------------
  // Шинэ тасалбар — вебийн `customComponents/AdviceFeed/PostComposer.jsx`
  // ------------------------------------------------------------------

  /// Тасалбарын хавсралтын дээд хэмжээ — сервер чатаас бусад бүх объектод
  /// 10 МБ хэрэглэнэ (`BaseController.js` § `MAX_UPLOAD_BYTES`).
  static const int maxTicketFileBytes = 10 * 1024 * 1024;

  /// Тасалбарын хэлбэрүүд.
  ///
  /// Вебийн композер ч ингэж `/BaseObject/getData`-ээс авдаг: сонголт нь
  /// `OptionTypes` хүснэгтийн мөр, тиймээс шинэ хэлбэр нэмэх нь кодын өөрчлөлт
  /// биш, өгөгдлийн сангийн мөр.
  Future<List<TicketTypeOption>> fetchTicketTypes() async {
    final data = await _api.legacyObject(
      '/api/BaseObject/getData',
      body: <String, dynamic>{'ObjectName': 'Advice'},
    );
    for (final field in _flattenFields(data['Fields'])) {
      if (field['Name'] != 'ticket_type') continue;
      return Envelope.asList(field['Data'])
          .map(TicketTypeOption.fromJson)
          // '-1' бол "сонгоогүй" гэсэн тэмдэг — сервер ч татгалздаг.
          .where((TicketTypeOption o) => o.value.isNotEmpty && o.value != '-1')
          .toList(growable: false);
    }
    return const <TicketTypeOption>[];
  }

  /// `Fields` нь ModelConfig-ийн мөрүүд — массив доторх массив.
  static List<Map<String, dynamic>> _flattenFields(dynamic value) {
    final out = <Map<String, dynamic>>[];
    void walk(dynamic v) {
      if (v is List) {
        for (final dynamic e in v) {
          walk(e);
        }
      } else if (v is Map) {
        out.add(Envelope.asMap(v));
      }
    }

    walk(value);
    return out;
  }

  /// Тасалбар үүсгээд нэг үйлдлээр нийтэлнэ (`CustomSaveAndPublish`).
  ///
  /// Харагдах хүрээг (`level`, аймаг, сум) сервер эмчийн байгууллагаас өөрөө
  /// тогтооно — клиент дамжуулахгүй, дамжуулсан ч үл тоомсорлоно.
  Future<int> publishTicket({
    required int patientId,
    required String ticketType,
    required String body,
  }) {
    return _createTicket(
      '/api/Advice/CustomSaveAndPublish',
      patientId: patientId,
      ticketType: ticketType,
      body: body,
    );
  }

  /// Ноорог (`CustomSave`) — зөвхөн зохиогчид харагдана.
  Future<int> saveTicketDraft({
    required int patientId,
    required String ticketType,
    required String body,
  }) {
    return _createTicket(
      '/api/Advice/CustomSave',
      patientId: patientId,
      ticketType: ticketType,
      body: body,
    );
  }

  Future<int> _createTicket(
    String path, {
    required int patientId,
    required String ticketType,
    required String body,
  }) async {
    final data = await _api.legacyObject(
      path,
      body: <String, dynamic>{
        'Data': jsonEncode(<String, dynamic>{
          'adv_id_patient': patientId,
          'ticket_type': ticketType,
          'Body': body.trim(),
        }),
      },
    );
    final id = data['DataId'];
    return id is num ? id.toInt() : int.tryParse('$id') ?? 0;
  }

  /// Тасалбарын хавсралт. Тасалбар үүссэний ДАРАА — File мөр нь тасалбарын
  /// id-г заадаг. Вебийнх шиг бүх файл нэг хүсэлтэд, `File{i}Info` нь `Name`
  /// -тэй: сервер тэр нэрийг уншдаг, дутуу бол хүсэлт хариугүй үлддэг байв.
  Future<void> uploadTicketFiles({
    required int ticketId,
    required List<File> files,
  }) {
    return _uploadLinkedFiles(
      linkedObjectName: 'Advice',
      linkedObjectId: ticketId,
      files: files,
    );
  }

  /// `/BaseObject/uploadFile` — вебийн `BaseUploadFile`-тэй ижил: бүх файл нэг
  /// хүсэлтэд, `File{i}Info` нь `Name`-тэй. Сервер тэр нэрийг уншдаг, дутуу бол
  /// хүсэлт хариугүй үлддэг байв; файл бүрийг тусад нь илгээвэл сервер
  /// өмнөхийг нь устгадаг.
  Future<void> _uploadLinkedFiles({
    required String linkedObjectName,
    required int linkedObjectId,
    required List<File> files,
  }) async {
    if (files.isEmpty) return;
    final fields = <String, dynamic>{
      'LinkedObjectInfo': jsonEncode(<String, dynamic>{
        'LinkedObjectId': linkedObjectId,
        'LinkedObjectName': linkedObjectName,
        'FieldName': 'Files',
      }),
    };
    for (var i = 0; i < files.length; i++) {
      final name = files[i].uri.pathSegments.last;
      fields['File$i'] =
          await MultipartFile.fromFile(files[i].path, filename: name);
      fields['File${i}Info'] = jsonEncode(<String, dynamic>{'Name': name});
    }
    await _api.upload(
      '/api/BaseObject/uploadFile',
      form: FormData.fromMap(fields),
    );
  }

  // ------------------------------------------------------------------
  // Тасалбарын урсгал — вебийн `view/AdviceHome.jsx`, `AdviceComment.jsx`
  // ------------------------------------------------------------------

  /// Хамрах хүрээг сервер тогтооно (`BuildAdviceScope`): эмч өөрийн
  /// байгууллагын түвшинд харагдах тасалбаруудыг л хардаг.
  Future<Paged<FeedTicket>> fetchFeed({
    FeedFilter filter = FeedFilter.all,
    String search = '',
    int pageNumber = 0,
    int pageSize = 10,
  }) async {
    final response = await _api.legacyResponse(
      '/api/Advice/GetFeed',
      body: <String, dynamic>{
        'PageNumber': pageNumber,
        'PageSize': pageSize,
        'Filter': filter.apiValue,
        'Search': search.trim(),
      },
    );
    final body = Envelope.asMap(response.data);
    final rows = Envelope.asList(body['Data'])
        .map(FeedTicket.fromFeed)
        .toList(growable: false);
    final rawTotal = Envelope.asMap(body['Option'])['Total'];
    final total = rawTotal is num
        ? rawTotal.toInt()
        : int.tryParse('$rawTotal') ?? rows.length;
    return Paged<FeedTicket>(
      items: rows,
      total: total,
      limit: pageSize,
      offset: pageNumber * pageSize,
    );
  }

  /// Нэг тасалбар — урсгалын картын адил баяжуулсан, илүү том зурагтай.
  /// Олдохгүй бол `null` (сервер хоосон `Data` буцаадаг).
  Future<FeedTicket?> fetchTicket(int id) async {
    final response = await _api.legacyResponse(
      '/api/Advice/GetTicket',
      body: <String, dynamic>{'AdviceId': id},
    );
    final data = Envelope.asMap(Envelope.asMap(response.data)['Data']);
    return data.isEmpty ? null : FeedTicket.fromFeed(data);
  }

  Future<List<FeedComment>> fetchComments(int adviceId) async {
    final rows = await _api.legacyList(
      '/api/Advice/GetComments',
      body: <String, dynamic>{'AdviceId': adviceId},
    );
    return rows.map(FeedComment.fromThread).toList(growable: false);
  }

  /// Хариулт бичих. Шинэ хариултын id-г буцаана — зураг түүнд хавсарна.
  Future<int> postComment({
    required int adviceId,
    required String text,
  }) async {
    final data = await _api.legacyObject(
      '/api/Advice/CreateComment',
      body: <String, dynamic>{
        'ObjectName': 'AdviceComment',
        'Data': jsonEncode(<String, dynamic>{
          'adv_com_id_adv': adviceId,
          'adv_com_comment': text.trim(),
        }),
      },
    );
    final id = data['DataId'];
    return id is num ? id.toInt() : int.tryParse('$id') ?? 0;
  }

  Future<void> uploadCommentFiles({
    required int commentId,
    required List<File> files,
  }) {
    return _uploadLinkedFiles(
      linkedObjectName: 'AdviceComment',
      linkedObjectId: commentId,
      files: files,
    );
  }

  /// Тасалбар хаах — вебийн дэлгэрэнгүй хуудасны "Close". Эрхийг сервер
  /// шалгана.
  Future<void> closeTicket(int id) async {
    await _api.legacyObject(
      '/api/Advice/CustomSave',
      body: <String, dynamic>{
        'Data': jsonEncode(<String, dynamic>{
          'id_data': id,
          'adv_ticket_closed': 'y',
        }),
      },
    );
  }

  /// "Үзсэн" тоолуур — вебийн дэлгэрэнгүй хуудас нээгдэх бүрт бичдэг
  /// (`SaveAdviceViews`). Бүтэлгүйтэл уншигчид хамаагүй тул залгина.
  Future<void> markViewed({required int adviceId, required int userId}) async {
    final now = DateTime.now();
    String two(int v) => v.toString().padLeft(2, '0');
    final stamp = '${now.year}-${two(now.month)}-${two(now.day)} '
        '${two(now.hour)}:${two(now.minute)}:${two(now.second)}';
    try {
      await _api.legacy(
        '/api/BaseObject/create',
        body: <String, dynamic>{
          'ObjectName': 'AdviceViews',
          'Data': jsonEncode(<String, dynamic>{
            'AdviceId': adviceId,
            'UserId': userId,
            'ViewDate': stamp,
          }),
        },
      );
    } catch (_) {
      // Тоолуур л алдагдана; тасалбарыг уншихад саад болохгүй.
    }
  }

  Future<PatientCard> fetchPatientCard(int id) async {
    final data = await _api.getObject('/api/doctor/patients/$id');
    return PatientCard.fromJson(data);
  }

  /// Үйлчлүүлэгчийн цахим үзлэгийн хүсэлтүүд.
  ///
  /// `/api/doctor/*` дээр энэ өгөгдлийг өгөх endpoint **байхгүй** тул хуучин
  /// ерөнхий жагсаалт `/api/RemoteVisit/GetList`-ийг шүүлтүүртэй дуудаж байна.
  ///
  /// **Аюулгүй байдлын шалгалт.** Тэр жагсаалт нь ерөнхий CRUD бөгөөд эмчид
  /// шүүлтгүй дуудвал **бүх үйлчлүүлэгчийн** хүсэлтийг буцаана. Хэрэв талбарын
  /// нэр өөрчлөгдөж шүүлтүүр чимээгүй ажиллахаа болих юм бол өөр хүний
  /// мэдээлэл энэ үйлчлүүлэгчийн карт дээр гарна. Иймд хариуг **буцаж
  /// шалгана**: мөр бүр хүссэн `PatientId`-тай эсэхийг баталгаажуулж, тохирохгүй
  /// бол өгөгдөл харуулахын оронд алдаа шиднэ.
  Future<List<DoctorEvisit>> fetchPatientEvisits(int patientId) async {
    final rows = await _api.legacyList(
      '/api/RemoteVisit/GetList',
      body: <String, dynamic>{
        'PageNumber': 1,
        'PageSize': 50,
        'SearchField': <Map<String, dynamic>>[
          <String, dynamic>{
            'Field': 'PatientId',
            'Value': patientId,
            'Op': 'Equals',
          },
        ],
      },
    );

    final visits = rows.map(DoctorEvisit.fromJson).toList(growable: false);

    final leaked = visits.any((DoctorEvisit v) => v.patientId != patientId);
    if (leaked) {
      throw ApiException(
        'Цахим үзлэгийн мэдээллийг найдвартай шүүж чадсангүй. '
        'Аюулгүй байдлын үүднээс харуулахгүй байна.',
        code: 'EVISIT_FILTER_UNVERIFIED',
      );
    }

    return visits;
  }
}
