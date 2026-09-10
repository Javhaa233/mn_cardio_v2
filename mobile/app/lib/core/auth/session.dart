import 'dart:convert';

/// Нэвтэрсэн хэрэглэгчийн мэдээлэл. Login болон refresh хоёулаа `LogedUser`
/// нэртэй ижил бүтэц буцаана (API.md §2).
class LogedUser {
  const LogedUser({
    required this.id,
    required this.userName,
    required this.roleId,
    this.patient,
  });

  final int id;
  final String userName;
  final int roleId;
  final PatientRef? patient;

  /// RoleId 4 = үйлчлүүлэгч. Энэ апп-ын үйлчлүүлэгчийн модуль зөвхөн түүнд
  /// зориулагдсан — API.md §2 "Role IDs".
  bool get isPatient => roleId == 4;

  bool get isDoctor => roleId == 1 || roleId == 2 || roleId == 3 || roleId == 6;

  String get displayName {
    final p = patient;
    if (p != null && p.fullName.trim().isNotEmpty) return p.fullName;
    return userName;
  }

  factory LogedUser.fromJson(Map<String, dynamic> json) {
    final patientJson = json['Patient'];
    return LogedUser(
      id: _int(json['Id']) ?? 0,
      userName: (json['UserName'] as String?) ?? '',
      roleId: _int(json['RoleId']) ?? 0,
      patient: patientJson is Map
          ? PatientRef.fromJson(Map<String, dynamic>.from(patientJson))
          : null,
    );
  }

  Map<String, dynamic> toJson() => <String, dynamic>{
        'Id': id,
        'UserName': userName,
        'RoleId': roleId,
        if (patient != null) 'Patient': patient!.toJson(),
      };

  static int? _int(dynamic v) {
    if (v is int) return v;
    if (v is num) return v.toInt();
    if (v is String) return int.tryParse(v);
    return null;
  }
}

/// Login хариунд ирдэг үйлчлүүлэгчийн товч мэдээлэл. Дэлгэрэнгүйг
/// `GET /api/patient/me` -ээс авна.
class PatientRef {
  const PatientRef({
    required this.idData,
    required this.lastName,
    required this.firstName,
    required this.registration,
  });

  final int idData;
  final String lastName;
  final String firstName;
  final String registration;

  String get fullName {
    final parts = <String>[
      if (lastName.trim().isNotEmpty) lastName.trim(),
      if (firstName.trim().isNotEmpty) firstName.trim(),
    ];
    return parts.join(' ');
  }

  factory PatientRef.fromJson(Map<String, dynamic> json) => PatientRef(
        idData: LogedUser._int(json['id_data']) ?? 0,
        lastName: (json['p_lastname'] as String?) ?? '',
        firstName: (json['p_firstname'] as String?) ?? '',
        registration: (json['p_registration'] as String?) ?? '',
      );

  Map<String, dynamic> toJson() => <String, dynamic>{
        'id_data': idData,
        'p_lastname': lastName,
        'p_firstname': firstName,
        'p_registration': registration,
      };
}

/// Нэвтрэлтийн үр дүн — хоёр токен ба хэрэглэгч.
class AuthTokens {
  const AuthTokens({
    required this.accessToken,
    this.refreshToken,
    this.expiresAt,
    this.user,
  });

  final String accessToken;
  final String? refreshToken;
  final DateTime? expiresAt;
  final LogedUser? user;

  bool get isExpired {
    final at = expiresAt;
    if (at == null) return false;
    return DateTime.now().isAfter(at);
  }
}

/// JWT-ийн `exp` талбарыг гаргаж авна.
///
/// Гарын үсгийг **шалгахгүй** — энэ нь зөвхөн "хэзээ сэргээх вэ" гэдгийг
/// клиент талд тооцоолоход хэрэглэгдэнэ. Эрхийн шийдвэрийг сервер гаргана.
DateTime? jwtExpiry(String token) {
  try {
    final parts = token.split('.');
    if (parts.length != 3) return null;
    var payload = parts[1].replaceAll('-', '+').replaceAll('_', '/');
    while (payload.length % 4 != 0) {
      payload += '=';
    }
    final decoded = utf8.decode(base64.decode(payload));
    final map = jsonDecode(decoded);
    if (map is! Map) return null;
    final exp = map['exp'];
    if (exp is! num) return null;
    return DateTime.fromMillisecondsSinceEpoch(exp.toInt() * 1000);
  } catch (_) {
    return null;
  }
}
