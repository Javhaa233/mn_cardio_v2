import 'package:flutter_test/flutter_test.dart';
import 'package:mncardio/core/network/envelope.dart';

/// Хоёр дугтуйг зөв ялгаж, алдааг барьж байгаа эсэх.
///
/// Хамгийн чухал шалгуур: **хуучин давхарга алдааг HTTP 200-оор буцаадаг.**
/// Хэрэв энэ логик эвдэрвэл UI чимээгүйгээр хоосон жагсаалт харуулж эхэлнэ —
/// эмнэлгийн апп дээр хамгийн аюултай төрлийн алдаа.
void main() {
  group('Хуучин дугтуй (PascalCase)', () {
    test('Success:false нь HTTP 200 байсан ч алдаа болно', () {
      final failure = envelopeFailureOf(
        <String, dynamic>{
          'Success': false,
          'Message': 'Хэрэглэгч олдсонгүй',
          'Data': null,
        },
        statusCode: 200,
      );

      expect(failure, isNotNull);
      expect(failure!.message, 'Хэрэглэгч олдсонгүй');
      expect(failure.statusCode, 200);
    });

    test('AuthError:true нь токен сэргээх шаардлагатайг илэрхийлнэ', () {
      final failure = envelopeFailureOf(<String, dynamic>{
        'Success': false,
        'Message': 'There is a user who is not logged into the system',
        'AuthError': true,
      });

      expect(failure, isNotNull);
      expect(failure!.isAuthError, isTrue);
      expect(failure.isTokenInvalid, isTrue);
    });

    test('Success:true үед алдаа биш', () {
      final failure = envelopeFailureOf(<String, dynamic>{
        'Success': true,
        'Data': <String>['a'],
      });
      expect(failure, isNull);
    });

    test('Мессеж байхгүй бол монгол нөөц текст', () {
      final failure = envelopeFailureOf(<String, dynamic>{'Success': false});
      expect(failure!.message, 'Алдаа гарлаа. Дахин оролдоно уу.');
    });
  });

  group('Мобайлын дугтуй (lowercase)', () {
    test('success:false нь код-той алдаа болно', () {
      final failure = envelopeFailureOf(
        <String, dynamic>{
          'success': false,
          'code': 'PATIENT_NOT_RESOLVED',
          'message': 'Бүртгэл олдсонгүй',
        },
        statusCode: 403,
      );

      expect(failure, isNotNull);
      expect(failure!.code, 'PATIENT_NOT_RESOLVED');
      expect(failure.isPatientNotResolved, isTrue);
      expect(failure.isForbidden, isTrue);
    });

    test('TOKEN_INVALID нь сэргээх шаардлагатай', () {
      final failure = envelopeFailureOf(
        <String, dynamic>{'success': false, 'code': 'TOKEN_INVALID'},
        statusCode: 401,
      );
      expect(failure!.isTokenInvalid, isTrue);
    });

    test('success:true үед алдаа биш', () {
      expect(
        envelopeFailureOf(<String, dynamic>{'success': true, 'data': null}),
        isNull,
      );
    });
  });

  group('Дугтуй танихгүй хэлбэр', () {
    test('Жагсаалт эсвэл null бол алдаа гэж үзэхгүй', () {
      expect(envelopeFailureOf(<dynamic>[1, 2]), isNull);
      expect(envelopeFailureOf(null), isNull);
      expect(envelopeFailureOf('текст'), isNull);
    });
  });

  group('Задлах туслахууд', () {
    test('asList нь Map биш элементийг алгасахгүй, хоосон болгоно', () {
      final rows = Envelope.asList(<dynamic>[
        <String, dynamic>{'id': 1},
        <String, dynamic>{'id': 2},
      ]);
      expect(rows.length, 2);
      expect(rows.first['id'], 1);
    });

    test('asList нь жагсаалт биш утганд хоосон буцаана', () {
      expect(Envelope.asList(null), isEmpty);
      expect(Envelope.asList(<String, dynamic>{'a': 1}), isEmpty);
    });

    test('messageOf нь хоосон мессежийг нөөц текстээр солино', () {
      expect(
        Envelope.messageOf(<String, dynamic>{'Message': '   '}, fallback: 'нөөц'),
        'нөөц',
      );
      expect(
        Envelope.messageOf(<String, dynamic>{'message': 'сервер'}, fallback: 'нөөц'),
        'сервер',
      );
    });
  });

  group('Хуудаслалт', () {
    test('hasMore нь нийт тоотой харьцуулж тооцогдоно', () {
      const page = Paged<int>(items: <int>[1, 2, 3], total: 10, limit: 3, offset: 0);
      expect(page.hasMore, isTrue);

      const last = Paged<int>(items: <int>[9, 10], total: 10, limit: 3, offset: 8);
      expect(last.hasMore, isFalse);
    });
  });
}
