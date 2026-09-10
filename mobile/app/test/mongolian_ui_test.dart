import 'package:flutter_test/flutter_test.dart';
import 'package:mncardio/core/util/mn_format.dart';
import 'package:mncardio/core/util/mn_text.dart';
import 'package:mncardio/core/util/validators.dart';
import 'package:mncardio/features/advice/advice.dart';
import 'package:mncardio/features/journal/journal_entry.dart';

/// Монгол хэл, форматлалт, эмнэлзүйн шалгалтын тестүүд.
void main() {
  group('Англи текст хэрэглэгчид харагдахгүй (Техникийн шаардлага §1.3.11)', () {
    test('Кирилл мессежийг серверээс дамжуулна', () {
      expect(mnMessage('Хэрэглэгч олдсонгүй', 'нөөц'), 'Хэрэглэгч олдсонгүй');
    });

    test('Англи мессежийг нөөц монгол текстээр солино', () {
      expect(
        mnMessage('There is a user who is not logged into the system', 'Нэвтэрнэ үү'),
        'Нэвтэрнэ үү',
      );
    });

    test('Хоосон мессежийг нөөц текстээр солино', () {
      expect(mnMessage('', 'нөөц'), 'нөөц');
      expect(mnMessage(null, 'нөөц'), 'нөөц');
    });

    test('Ө, Ү үсгийг кирилл гэж таньдаг', () {
      expect(isMongolianText('ЗСӨ үнэлгээ'), isTrue);
      expect(isMongolianText('SpO2 98%'), isFalse);
    });
  });

  group('Огнооны формат', () {
    test('Эмнэлгийн баримтын хэлбэр yyyy.MM.dd', () {
      expect(MnFormat.date(DateTime(2026, 9, 10)), '2026.09.10');
    });

    test('API руу явах хэлбэр yyyy-MM-dd', () {
      expect(MnFormat.apiDate(DateTime(2026, 9, 10)), '2026-09-10');
    });

    test('null огноо нь зураасаар харагдана', () {
      expect(MnFormat.date(null), '—');
    });

    test('Өнөөдөр гэж бичнэ', () {
      expect(MnFormat.friendlyDate(DateTime.now()), 'Өнөөдөр');
    });

    test('Нас төрсөн огноогоор тооцогдоно', () {
      final born = DateTime(DateTime.now().year - 40, 1, 1);
      expect(MnFormat.ageFrom(born), 40);
    });

    test('Хугацааг монголоор бичнэ', () {
      expect(MnFormat.duration(90), '1 мин 30 сек');
      expect(MnFormat.duration(120), '2 мин');
      expect(MnFormat.duration(45), '45 сек');
      expect(MnFormat.duration(null), '—');
    });
  });

  group('Хэмжилтийн шалгалт', () {
    test('Хоосон утга заавал биш талбарт зөвшөөрөгдөнө', () {
      expect(Validators.systolic(''), isNull);
      expect(Validators.pulse(null), isNull);
    });

    test('Хязгаараас гарсан утга монгол алдаа өгнө', () {
      final error = Validators.systolic('400');
      expect(error, isNotNull);
      expect(isMongolianText(error!), isTrue);
    });

    test('Тоо биш утга татгалзана', () {
      expect(Validators.pulse('аяга'), isNotNull);
    });

    test('Боломжит утга зөвшөөрөгдөнө', () {
      expect(Validators.systolic('120'), isNull);
      expect(Validators.diastolic('80'), isNull);
      expect(Validators.pulse('72'), isNull);
      expect(Validators.weight('70.5'), isNull);
      expect(Validators.inr('2,5'), isNull, reason: 'таслалыг цэг болгож уншина');
      expect(Validators.borg('13'), isNull);
    });

    test('Нууц үг серверийн дүрэмтэй яг таарна', () {
      // helper/PasswordPolicy.js: 8+, том үсэг, жижиг үсэг, тоо, тусгай тэмдэгт.
      expect(Validators.newPassword('Parol123!'), isNull);
      expect(Validators.newPassword('Parol_123'), isNull);

      expect(Validators.newPassword('parol123!'), isNotNull,
          reason: 'том үсэггүй');
      expect(Validators.newPassword('PAROL123!'), isNotNull,
          reason: 'жижиг үсэггүй');
      expect(Validators.newPassword('ParolAbc!'), isNotNull,
          reason: 'тоогүй');
      expect(Validators.newPassword('Parol1234'), isNotNull,
          reason: 'тусгай тэмдэгтгүй');
      expect(Validators.newPassword('Pa1!'), isNotNull, reason: '8-аас богино');
    });

    test('Зөвхөн кирилл нууц үг татгалзана — серверийн regex латин үсэг шаарддаг',
        () {
      expect(Validators.newPassword('Нууцүг123!'), isNotNull);
    });

    test('Нууц үгийн бүх алдааны мессеж монгол', () {
      for (final bad in <String>['короткий', 'parol123!', 'PAROL123!', 'Pa1!']) {
        final error = Validators.newPassword(bad);
        expect(error, isNotNull);
        expect(isMongolianText(error!), isTrue);
      }
    });
  });

  group('Тэмдэглэлийн харагдац', () {
    test('Даралт 120/80 хэлбэрээр', () {
      const entry = JournalEntry(
        idData: 1,
        systolic: 120,
        diastolic: 80,
      );
      expect(entry.bloodPressureLabel, '120/80');
    });

    test('Доод даралт байхгүй үед зөвхөн дээд утга', () {
      const entry = JournalEntry(idData: 1, systolic: 130);
      expect(entry.bloodPressureLabel, '130');
    });

    test('Хэмжилт огт байхгүйг таньдаг', () {
      const entry = JournalEntry(idData: 1, comment: 'зөвхөн тайлбар');
      expect(entry.isEmptyReading, isTrue);
      expect(entry.bloodPressureLabel, '—');
    });

    test('blood_pressure2-ыг мөн серверт илгээнэ', () {
      // Backend түүнийг өнөөдөр үл тоомсорлодог ч (READINESS.md §2.9),
      // засагдмагц апп талд өөрчлөлт хийхгүйгээр ажиллах ёстой.
      final body = JournalDraft(
        date: DateTime(2026, 9, 10),
        systolic: 120,
        diastolic: 80,
      ).toJson();

      expect(body['date'], '2026-09-10');
      expect(body['blood_pressure'], 120);
      expect(body['blood_pressure2'], 80);
    });

    test('Хоосон талбарууд биед орохгүй', () {
      final body = JournalDraft(date: DateTime(2026, 9, 10)).toJson();
      expect(body.containsKey('pulse'), isFalse);
      expect(body.containsKey('comment'), isFalse);
    });
  });

  group('Зөвлөгөөний хоосон Body', () {
    test('Body хоосон бол эхний сэтгэгдэл агуулга болно', () {
      // Тасалбруудын 57% нь ийм — эмнэлзүйн агуулга эхний хариунд байдаг.
      const advice = Advice(
        idData: 1,
        body: '',
        closed: true,
        comments: <AdviceComment>[
          AdviceComment(idData: 10, comment: 'Эмийн тунгаа тохируулна уу.'),
          AdviceComment(idData: 11, comment: 'Баярлалаа.'),
        ],
      );

      expect(advice.displayBody, 'Эмийн тунгаа тохируулна уу.');
      expect(advice.thread.length, 1);
      expect(advice.thread.first.comment, 'Баярлалаа.');
    });

    test('Body бөглөгдсөн бол бүх сэтгэгдэл урсгалд үлдэнэ', () {
      const advice = Advice(
        idData: 1,
        body: 'Үндсэн зөвлөгөө',
        closed: false,
        comments: <AdviceComment>[
          AdviceComment(idData: 10, comment: 'Нэмэлт'),
        ],
      );

      expect(advice.displayBody, 'Үндсэн зөвлөгөө');
      expect(advice.thread.length, 1);
    });
  });
}
