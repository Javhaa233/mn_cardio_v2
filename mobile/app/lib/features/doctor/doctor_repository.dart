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
