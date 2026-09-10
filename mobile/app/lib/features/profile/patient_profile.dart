import '../../core/util/json_read.dart';
import '../../core/util/mn_format.dart';

/// 2.1 Миний бүртгэл — `GET /api/patient/me` буцаадаг талбарууд.
///
/// Талбарын нэрсийг тендерийн дагуу үг үсэгчлэн авсан. Эмнэлзүйн шошгыг
/// өөрчлөх нь бидний эрх биш (mobile/README.md § "Ground rules").
class PatientProfile {
  const PatientProfile({
    required this.idData,
    required this.registration,
    required this.lastName,
    required this.firstName,
    this.birthday,
    this.age,
    this.telephone,
    this.telephone2,
    this.workplace,
    this.provinceCity,
    this.soumDistrict,
    this.bagKhoroo,
  });

  final int idData;
  final String registration;
  final String lastName;
  final String firstName;
  final DateTime? birthday;
  final int? age;
  final String? telephone;
  final String? telephone2;
  final String? workplace;
  final String? provinceCity;
  final String? soumDistrict;
  final String? bagKhoroo;

  String get fullName {
    final parts = <String>[
      if (lastName.trim().isNotEmpty) lastName.trim(),
      if (firstName.trim().isNotEmpty) firstName.trim(),
    ];
    return parts.isEmpty ? '—' : parts.join(' ');
  }

  /// Нэрний товчлол — зурагны оронд.
  String get initials {
    final first = firstName.trim();
    final last = lastName.trim();
    if (first.isNotEmpty && last.isNotEmpty) {
      return '${last[0]}${first[0]}'.toUpperCase();
    }
    if (first.isNotEmpty) return first[0].toUpperCase();
    if (last.isNotEmpty) return last[0].toUpperCase();
    return '—';
  }

  /// `p_age` хоосон байвал төрсөн огноогоор тооцно.
  int? get effectiveAge => age ?? MnFormat.ageFrom(birthday);

  /// Аймаг/хот · сум/дүүрэг · баг/хороо гурвыг нэгтгэсэн хаяг.
  String get address {
    final parts = <String>[
      if ((provinceCity ?? '').trim().isNotEmpty) provinceCity!.trim(),
      if ((soumDistrict ?? '').trim().isNotEmpty) soumDistrict!.trim(),
      if ((bagKhoroo ?? '').trim().isNotEmpty) bagKhoroo!.trim(),
    ];
    return parts.isEmpty ? '' : parts.join(', ');
  }

  /// Регистрийн дугаарыг бүтнээр нь харуулахгүй нуух хэлбэр.
  ///
  /// Хувийн мэдээллийг шаардлагагүй үед ил гаргахгүй байх зарчим — дэлгэц
  /// дээр анхнаасаа далдалж, хэрэглэгч өөрөө нээж харна.
  String get maskedRegistration {
    final value = registration.trim();
    if (value.length <= 4) return value.isEmpty ? '—' : value;
    return '${value.substring(0, 2)}${'*' * (value.length - 4)}'
        '${value.substring(value.length - 2)}';
  }

  factory PatientProfile.fromJson(Map<String, dynamic> json) => PatientProfile(
        idData: J.intOf(json, <String>['id_data', 'Id']) ?? 0,
        registration: J.strOr(json, <String>['p_registration']),
        lastName: J.strOr(json, <String>['p_lastname']),
        firstName: J.strOr(json, <String>['p_firstname']),
        birthday: J.date(json, <String>['p_birthday']),
        age: J.intOf(json, <String>['p_age']),
        telephone: J.str(json, <String>['p_telephone']),
        telephone2: J.str(json, <String>['p_telephone2']),
        workplace: J.str(json, <String>['p_workplace']),
        provinceCity: J.str(json, <String>['addr_prov_city']),
        soumDistrict: J.str(json, <String>['addr_soum_dist']),
        bagKhoroo: J.str(json, <String>['addr_bag_khoroo']),
      );
}
