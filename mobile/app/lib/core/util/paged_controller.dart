import 'package:flutter/foundation.dart';

import '../config/app_config.dart';
import '../network/api_exception.dart';
import '../network/envelope.dart';
import 'async_state.dart';

/// Хуудаслалттай жагсаалтын нийтлэг логик.
///
/// Тэмдэглэл, асуулт, зөвлөгөө, цахим үзлэг — бүгд ижил загвартай: эхний
/// хуудас, доош гүйлгэхэд нэмэлт хуудас, дээрээс татаж сэргээх. Дэлгэц бүр
/// үүнийг дахин бичихийн оронд энэ ангийг өвлөнө.
abstract class PagedController<T> extends ChangeNotifier {
  PagedController({this.pageSize = AppConfig.pageSize});

  final int pageSize;

  AsyncState<List<T>> _state = AsyncState<List<T>>.idle();
  bool _loadingMore = false;
  bool _hasMore = true;
  int _total = 0;
  bool _disposed = false;

  AsyncState<List<T>> get state => _state;
  List<T> get items => _state.data ?? const <Never>[];
  bool get loadingMore => _loadingMore;
  bool get hasMore => _hasMore;
  int get total => _total;
  bool get isEmpty => _state.isReady && items.isEmpty;

  /// Серверээс нэг хуудас татах — удамшсан анги хэрэгжүүлнэ.
  Future<Paged<T>> fetchPage({required int limit, required int offset});

  /// Эхний хуудсыг татах, эсвэл дээрээс татан сэргээх.
  Future<void> load({bool refresh = false}) async {
    if (refresh && _state.hasData) {
      _emit(_state.toRefreshing());
    } else if (!_state.hasData) {
      _emit(AsyncState<List<T>>.loading());
    }

    try {
      final page = await fetchPage(limit: pageSize, offset: 0);
      _total = page.total;
      _hasMore = page.hasMore;
      _emit(AsyncState<List<T>>.ready(page.items));
    } on ApiException catch (e) {
      _emit(AsyncState<List<T>>.error(e, data: _state.data));
    }
  }

  /// Дараагийн хуудас.
  Future<void> loadMore() async {
    if (_loadingMore || !_hasMore || !_state.isReady) return;
    _loadingMore = true;
    _notify();
    try {
      final current = items;
      final page = await fetchPage(limit: pageSize, offset: current.length);
      _total = page.total;
      _hasMore = page.hasMore;
      _emit(AsyncState<List<T>>.ready(<T>[...current, ...page.items]));
    } on ApiException {
      // Нэмэлт хуудас татаж чадаагүй нь одоо харагдаж буй өгөгдлийг
      // алдагдуулах шалтгаан биш — дахин гүйлгэхэд дахин оролдоно.
      _hasMore = false;
    } finally {
      _loadingMore = false;
      _notify();
    }
  }

  /// Шүүлтүүр солигдох үед жагсаалтыг эхнээс нь дахин татна.
  Future<void> reset() async {
    _hasMore = true;
    _total = 0;
    _emit(AsyncState<List<T>>.loading());
    await load();
  }

  /// Шинэ бичлэг нэмсний дараа локал жагсаалтын эхэнд тавина.
  void prepend(T item) {
    final current = items;
    _total += 1;
    _emit(AsyncState<List<T>>.ready(<T>[item, ...current]));
  }

  /// Бичлэг устгасны дараа локал жагсаалтаас хасна.
  void removeWhere(bool Function(T item) test) {
    if (!_state.isReady) return;
    final next = items.where((T e) => !test(e)).toList(growable: false);
    _total = (_total - (items.length - next.length)).clamp(0, 1 << 30);
    _emit(AsyncState<List<T>>.ready(next));
  }

  void _emit(AsyncState<List<T>> next) {
    _state = next;
    _notify();
  }

  void _notify() {
    if (_disposed) return;
    notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    super.dispose();
  }
}
