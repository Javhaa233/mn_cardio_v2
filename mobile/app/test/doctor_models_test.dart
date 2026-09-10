import 'package:flutter_test/flutter_test.dart';
import 'package:mncardio/core/util/mn_text.dart';
import 'package:mncardio/features/doctor/doctor_models.dart';

/// Эмчийн модулийн загваруудыг backend-ийн **бодит** хариуны хэлбэрээр
/// шалгана. Талбарын нэрсийг `api/doctor/controller.js`-ээс шууд авсан.
void main() {
  group('DoctorMe', () {
    test('Профайл, байгууллагын мэдээллийг нийлүүлж уншина', () {
      final me = DoctorMe.fromJson(<String, dynamic>{
        'UserId': 42,
        'DoctorId': 7,
        'RoleId': '2',
        'IsAdmin': false,
        'FullName': 'Бат Дорж',
        'profile': <String, dynamic>{
          'email': 'bat@example.mn',
          'ProvCityName': 'Улаанбаатар',
          'SoumDistName': 'Баянзүрх',
        },
        'organization': <String, dynamic>{'Name': 'ЗСҮТ'},
      });

      expect(me.userId, 42);
      expect(me.doctorId, 7);
      expect(me.fullName, 'Бат Дорж');
      expect(me.initials, 'БД');
      expect(me.roleLabel, 'Эмч');
      expect(me.organizationName, 'ЗСҮТ');
      expect(me.location, 'Улаанбаатар, Баянзүрх');
    });

    test('Админыг ялгаж нэрлэнэ', () {
      final me = DoctorMe.fromJson(<String, dynamic>{
        'RoleId': '1',
        'IsAdmin': true,
        'FullName': 'Админ',
      });
      expect(me.roleLabel, 'Администратор');
    });

    test('Бүх шошго монгол', () {
      for (final roleId in <String>['1', '2', '3', '6', '9']) {
        final me = DoctorMe.fromJson(<String, dynamic>{
          'RoleId': roleId,
          'IsAdmin': roleId == '1',
          'FullName': 'Тест',
        });
        expect(isMongolianText(me.roleLabel), isTrue,
            reason: 'RoleId $roleId дээр англи шошго гарлаа');
      }
    });
  });

  group('DoctorVisit', () {
    test('Монгол онош байвал түүнийг эхэнд тавина', () {
      final visit = DoctorVisit.fromJson(<String, dynamic>{
        'id_data': 5,
        'visit_date': '2026-09-01',
        'main_diagnosis': 'Essential hypertension',
        'main_diagnosis_mn': 'Анхдагч даралт ихсэлт',
        'icd10': 'I10',
      });
      expect(visit.diagnosisLabel, 'Анхдагч даралт ихсэлт');
    });

    test('Монгол онош байхгүй бол эхийг харуулна', () {
      final visit = DoctorVisit.fromJson(<String, dynamic>{
        'id_data': 5,
        'main_diagnosis': 'Angina pectoris',
      });
      expect(visit.diagnosisLabel, 'Angina pectoris');
    });

    test('Онош огт байхгүй бол монгол тайлбар', () {
      final visit = DoctorVisit.fromJson(<String, dynamic>{'id_data': 5});
      expect(visit.diagnosisLabel, 'Онош тэмдэглэгдээгүй');
      expect(isMongolianText(visit.diagnosisLabel), isTrue);
    });

    test('Нэмэгдсэн Patient-ыг уншина', () {
      final visit = DoctorVisit.fromJson(<String, dynamic>{
        'id_data': 5,
        'PatientId': 100,
        'PatRegNo': 'УА12345678',
        'Patient': <String, dynamic>{
          'id_data': 100,
          'p_lastname': 'Дорж',
          'p_firstname': 'Бат',
          'p_age': 45,
        },
      });
      expect(visit.patient, isNotNull);
      expect(visit.patientName, 'Дорж Бат');
      expect(visit.patient!.subtitle, contains('45 настай'));
    });
  });

  group('AdviceStatus', () {
    test('adv_ticket_closed кодыг зөв уншина', () {
      expect(AdviceStatus.parse('n'), AdviceStatus.open);
      expect(AdviceStatus.parse('y'), AdviceStatus.closed);
      expect(AdviceStatus.parse('3'), AdviceStatus.draft);
    });

    test('Танихгүй утгыг нээлттэй гэж үзнэ', () {
      expect(AdviceStatus.parse(null), AdviceStatus.open);
      expect(AdviceStatus.parse(''), AdviceStatus.open);
    });

    test('Шошгууд монгол', () {
      for (final status in AdviceStatus.values) {
        expect(isMongolianText(status.label), isTrue);
      }
    });
  });

  group('DoctorAdviceDetail', () {
    test('Body хоосон бол эхний хариу агуулга болно', () {
      // Тасалбруудын 57% нь ийм — эмнэлзүйн агуулга эхний хариунд байдаг.
      final detail = DoctorAdviceDetail.fromJson(<String, dynamic>{
        'ticket': <String, dynamic>{
          'id_data': 1,
          'Body': '',
          'adv_ticket_closed': 'y',
        },
        'comments': <dynamic>[
          <String, dynamic>{'id_data': 10, 'adv_com_comment': 'Гол зөвлөгөө'},
          <String, dynamic>{'id_data': 11, 'adv_com_comment': 'Нэмэлт'},
        ],
      });

      expect(detail.displayBody, 'Гол зөвлөгөө');
      expect(detail.thread.length, 1);
      expect(detail.thread.first.comment, 'Нэмэлт');
      expect(detail.ticket.status, AdviceStatus.closed);
    });

    test('Body бөглөгдсөн бол бүх хариу урсгалд үлдэнэ', () {
      final detail = DoctorAdviceDetail.fromJson(<String, dynamic>{
        'ticket': <String, dynamic>{
          'id_data': 1,
          'Body': 'Үндсэн агуулга',
          'adv_ticket_closed': 'n',
        },
        'comments': <dynamic>[
          <String, dynamic>{'id_data': 10, 'adv_com_comment': 'Хариу'},
        ],
      });

      expect(detail.displayBody, 'Үндсэн агуулга');
      expect(detail.thread.length, 1);
    });
  });

  group('MonitoringRow', () {
    test('Хамгийн сүүлийн хэмжилт жагсаалттай хамт ирнэ', () {
      final row = MonitoringRow.fromJson(<String, dynamic>{
        'id_data': 3,
        'since': '2026-08-01',
        'patient': <String, dynamic>{
          'id_data': 100,
          'p_lastname': 'Дорж',
          'p_firstname': 'Бат',
        },
        'latestReading': <String, dynamic>{
          'id_data': 900,
          'date': '2026-09-09',
          'blood_pressure': 130,
          'blood_pressure2': 85,
          'pulse': 72,
        },
      });

      expect(row.patientId, 100);
      expect(row.latestReading, isNotNull);
      expect(row.latestReading!.bloodPressureLabel, '130/85');
    });

    test('Хэмжилтгүй мөр null үлдэнэ', () {
      final row = MonitoringRow.fromJson(<String, dynamic>{
        'id_data': 3,
        'patient': <String, dynamic>{'id_data': 100},
        'latestReading': null,
      });
      expect(row.latestReading, isNull);
    });
  });

  group('DoctorReport', () {
    test('Тоо ба эх сурвалжийн тэмдэглэгээг уншина', () {
      final report = DoctorReport.fromJson(<String, dynamic>{
        'window': <String, dynamic>{'from': '2026-08-01', 'to': '2026-09-01'},
        'myVisits': 12,
        'organizationVisits': 340,
        'monitoredPatients': 5,
        'adviceAuthored': 3,
        'topDiagnoses': <dynamic>[
          <String, dynamic>{'diagnosis': 'Даралт ихсэлт', 'total': 7},
          <String, dynamic>{'diagnosis': 'Зүрхний дутагдал', 'total': 2},
        ],
        'source': <String, dynamic>{
          'OrganizationId': 11,
          'generatedAt': '2026-09-10 12:00:00',
        },
      });

      expect(report.myVisits, 12);
      expect(report.organizationVisits, 340);
      expect(report.topDiagnoses.first.diagnosis, 'Даралт ихсэлт');
      expect(report.topDiagnoses.first.total, 7);
      // Техникийн шаардлага §29 — эх сурвалж заавал тэмдэглэгдэнэ.
      expect(report.sourceOrganizationId, 11);
      expect(report.generatedAt, isNotNull);
    });

    test('Хоосон тайланг таньдаг', () {
      expect(DoctorReport.empty.isEmpty, isTrue);
    });
  });

  group('PatientCard', () {
    test('Карт, үзлэг, график, хяналтын төлөвийг уншина', () {
      final card = PatientCard.fromJson(<String, dynamic>{
        'patient': <String, dynamic>{
          'id_data': 100,
          'p_registration': 'УА12345678',
          'p_lastname': 'Дорж',
          'p_firstname': 'Бат',
          'addr_prov_city': 'Улаанбаатар',
          'addr_soum_dist': 'Баянзүрх',
        },
        'visits': <dynamic>[
          <String, dynamic>{'id_data': 1, 'main_diagnosis_mn': 'Онош'},
        ],
        'journal': <String, dynamic>{
          'labels': <dynamic>['2026-09-01', '2026-09-02'],
          'series': <String, dynamic>{
            'blood_pressure': <dynamic>[120, 130],
            'blood_pressure2': <dynamic>[80, 85],
            'pulse': <dynamic>[70, 72],
            'weight': <dynamic>[null, null],
          },
        },
        'isMonitoredByMe': true,
      });

      expect(card.patient.fullName, 'Дорж Бат');
      expect(card.patient.address, 'Улаанбаатар, Баянзүрх');
      expect(card.visits.length, 1);
      expect(card.journal.hasBloodPressure, isTrue);
      expect(card.journal.hasWeight, isFalse);
      expect(card.isMonitoredByMe, isTrue);
    });
  });

  group('DoctorEvisit', () {
    test('PatientId-г уншина — шүүлтүүрийг шалгахад шаардлагатай', () {
      // Repository энэ талбараар мөр бүрийг шалгаж, өөр хүний бичлэг
      // орж ирсэн эсэхийг илрүүлдэг.
      final visit = DoctorEvisit.fromJson(<String, dynamic>{
        'Id': 4,
        'PatientId': 100,
        'Comment': 'Толгой өвдөж байна',
        'CreateDate': '2026-09-05 10:00:00',
      });

      expect(visit.id, 4);
      expect(visit.patientId, 100);
      expect(visit.comment, 'Толгой өвдөж байна');
      expect(visit.createDate, isNotNull);
    });
  });
}
