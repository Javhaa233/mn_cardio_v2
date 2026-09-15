import 'dart:io';

import 'package:dio/dio.dart';
import 'package:path/path.dart' as p;

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import '../../core/util/paged_controller.dart';
import 'question.dart';

/// 2.3 Эмчээс асуух асуулт.
class QuestionsRepository {
  QuestionsRepository(this._api);

  final ApiClient _api;

  Future<Paged<Question>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _api.getPaged<Question>(
      '/api/patient/questions',
      Question.fromJson,
      limit: limit,
      offset: offset,
    );
  }

  /// Шинэ асуулт.
  ///
  /// Файлгүй үед JSON-оор илгээнэ (сервер хоёуланг дэмждэг). Файлтай үед
  /// multipart: `comment` + `files` (5 хүртэл, тус бүр 20 MB). Текст эсвэл
  /// файлын **аль нэг** байхад хангалттай — зөвхөн зурагтай асуулт ч бодит
  /// асуулт (API.md §9.4).
  Future<void> ask(String comment, {List<File> files = const <File>[]}) async {
    if (files.isEmpty) {
      await _api.postObject(
        '/api/patient/questions',
        body: <String, dynamic>{'comment': comment.trim()},
      );
      return;
    }

    final form = FormData();
    if (comment.trim().isNotEmpty) {
      form.fields.add(MapEntry<String, String>('comment', comment.trim()));
    }
    for (final file in files) {
      form.files.add(
        MapEntry<String, MultipartFile>(
          'files',
          await MultipartFile.fromFile(file.path, filename: p.basename(file.path)),
        ),
      );
    }
    await _api.postMultipart('/api/patient/questions', form: form);
  }
}

class QuestionsController extends PagedController<Question> {
  QuestionsController(this._repo);

  final QuestionsRepository _repo;

  bool _sending = false;
  bool get sending => _sending;

  @override
  Future<Paged<Question>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _repo.fetchPage(limit: limit, offset: offset);
  }

  /// Асуулт илгээх. Амжилттай бол жагсаалтыг сэргээнэ.
  ///
  /// Сервер шинэ мөрийг буцаадаггүй тул локал жагсаалтад таамаглан нэмэхийн
  /// оронд дахин татна — id болон огноог сервер тогтооно.
  Future<ApiException?> ask(
    String comment, {
    List<File> files = const <File>[],
  }) async {
    if (_sending) return null;
    _sending = true;
    notifyListeners();
    try {
      await _repo.ask(comment, files: files);
      await load(refresh: true);
      return null;
    } on ApiException catch (e) {
      return e;
    } finally {
      _sending = false;
      notifyListeners();
    }
  }
}
