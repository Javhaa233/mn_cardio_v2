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

  /// Шинэ асуулт. `comment` хоосон бол сервер 400 `COMMENT_REQUIRED` өгнө.
  Future<void> ask(String comment) async {
    await _api.postObject(
      '/api/patient/questions',
      body: <String, dynamic>{'comment': comment.trim()},
    );
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
  Future<ApiException?> ask(String comment) async {
    if (_sending) return null;
    _sending = true;
    notifyListeners();
    try {
      await _repo.ask(comment);
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
