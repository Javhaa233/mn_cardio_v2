import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import '../../core/util/json_read.dart';
import '../../core/util/paged_controller.dart';

/// Серверийн нэг мэдэгдэл — API.md §2.8 ба §9.1.
///
/// Эмч, үйлчлүүлэгч хоёрын хариу **яг ижил хэлбэртэй** (сервер нэг функцээр
/// хэлбэржүүлдэг) тул нэг модель хоёуланд нь үйлчилнэ.
class AppNotification {
  const AppNotification({
    required this.id,
    required this.seen,
    this.notesMn,
    this.action,
    this.linkObjectName,
    this.linkObjectId,
    this.url,
    this.createDate,
  });

  final int id;
  final bool seen;

  /// Хэрэглэгчид харуулах монгол текст. `Notes` нь англи хөгжүүлэгчийн шошго —
  /// хэзээ ч харуулахгүй.
  final String? notesMn;

  /// Юу болсныг заах танигч (`ReplyQuestion`, `EvisitScheduled`, …).
  final String? action;

  /// Гүн холбоос: аль бичлэг рүү очих вэ.
  final String? linkObjectName;
  final int? linkObjectId;
  final String? url;
  final DateTime? createDate;

  String get text => (notesMn ?? '').trim().isEmpty
      ? 'Шинэ мэдэгдэл'
      : notesMn!.trim();

  factory AppNotification.fromJson(Map<String, dynamic> json) =>
      AppNotification(
        id: J.intOf(json, <String>['Id']) ?? 0,
        seen: J.boolOf(json, <String>['Seen']),
        notesMn: J.str(json, <String>['NotesMn']),
        action: J.str(json, <String>['Action']),
        linkObjectName: J.str(json, <String>['LinkObjectName']),
        linkObjectId: J.intOf(json, <String>['LinkObjectId']),
        url: J.str(json, <String>['Url']),
        createDate: J.date(json, <String>['CreateDate']),
      );

  AppNotification copyWith({bool? seen}) => AppNotification(
        id: id,
        seen: seen ?? this.seen,
        notesMn: notesMn,
        action: action,
        linkObjectName: linkObjectName,
        linkObjectId: linkObjectId,
        url: url,
        createDate: createDate,
      );
}

/// Эмч, үйлчлүүлэгчийн мэдэгдлийн гадаргуу нэг зам — зөвхөн угтвар нь өөр.
class NotificationsRepository {
  NotificationsRepository(this._api, {required this.isDoctor});

  final ApiClient _api;
  final bool isDoctor;

  String get _base => isDoctor ? '/api/doctor' : '/api/patient';

  Future<Paged<AppNotification>> fetchPage({
    required int limit,
    required int offset,
    bool unreadOnly = false,
  }) {
    return _api.getPaged<AppNotification>(
      '$_base/notifications',
      AppNotification.fromJson,
      limit: limit,
      offset: offset,
      query: <String, dynamic>{if (unreadOnly) 'unread': 1},
    );
  }

  Future<int> unreadCount() async {
    final data = await _api.getObject('$_base/notifications/unread-count');
    return J.intOf(data, <String>['unread']) ?? 0;
  }

  Future<void> markRead(int id) =>
      _api.postObject('$_base/notifications/$id/read');

  Future<int> markAllRead() async {
    final data = await _api.postObject('$_base/notifications/read-all');
    return J.intOf(data, <String>['marked']) ?? 0;
  }
}

class NotificationsController extends PagedController<AppNotification> {
  NotificationsController(this._repo);

  final NotificationsRepository _repo;

  bool _unreadOnly = false;
  int _unread = 0;

  bool get unreadOnly => _unreadOnly;
  int get unread => _unread;

  @override
  Future<Paged<AppNotification>> fetchPage({
    required int limit,
    required int offset,
  }) {
    return _repo.fetchPage(
      limit: limit,
      offset: offset,
      unreadOnly: _unreadOnly,
    );
  }

  Future<void> setUnreadOnly(bool value) async {
    if (_unreadOnly == value) return;
    _unreadOnly = value;
    await reset();
  }

  /// Хонхны тоо. Алдааг залгина — тоо харагдахгүй байх нь дэлгэц унагаах
  /// шалтгаан биш.
  Future<void> refreshUnread() async {
    try {
      final value = await _repo.unreadCount();
      if (value == _unread) return;
      _unread = value;
      notifyListeners();
    } on ApiException {
      // Чимээгүй өнгөрнө.
    }
  }

  /// Уншсан болгох. Жагсаалтыг дахин татахгүй — мөрөө шууд шинэчилнэ.
  Future<void> markRead(AppNotification item) async {
    if (item.seen) return;
    _replace(item.copyWith(seen: true));
    if (_unread > 0) _unread -= 1;
    notifyListeners();
    try {
      await _repo.markRead(item.id);
    } on ApiException {
      // Амжилтгүй бол дараагийн ачаалалт бодит төлөвийг авчирна.
    }
  }

  Future<void> markAllRead() async {
    try {
      await _repo.markAllRead();
    } on ApiException {
      return;
    }
    _unread = 0;
    await reset();
  }

  void _replace(AppNotification updated) {
    final current = state.data;
    if (current == null) return;
    final next = <AppNotification>[
      for (final item in current)
        if (item.id == updated.id) updated else item,
    ];
    replaceItems(next);
  }
}
