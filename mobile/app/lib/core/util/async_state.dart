import '../network/api_exception.dart';

enum LoadStatus { idle, loading, refreshing, ready, error }

/// Дэлгэц бүрийн ачаалалтын төлөвийг нэг хэлбэрээр илэрхийлнэ.
///
/// Ингэснээр "ачаалж байна / алдаа / хоосон / өгөгдөл" дөрвөн байдлыг дэлгэц
/// бүр өөрөөрөө зохиохгүй — монгол текст, хоосон дэлгэцийн харагдац нэг мөр
/// байна.
class AsyncState<T> {
  const AsyncState._({
    required this.status,
    this.data,
    this.error,
  });

  const AsyncState.idle() : this._(status: LoadStatus.idle);

  const AsyncState.loading({T? data})
      : this._(status: LoadStatus.loading, data: data);

  const AsyncState.refreshing(T data)
      : this._(status: LoadStatus.refreshing, data: data);

  const AsyncState.ready(T data)
      : this._(status: LoadStatus.ready, data: data);

  const AsyncState.error(ApiException error, {T? data})
      : this._(status: LoadStatus.error, error: error, data: data);

  final LoadStatus status;
  final T? data;
  final ApiException? error;

  bool get isIdle => status == LoadStatus.idle;
  bool get isLoading => status == LoadStatus.loading;
  bool get isRefreshing => status == LoadStatus.refreshing;
  bool get isReady => status == LoadStatus.ready;
  bool get hasError => status == LoadStatus.error;
  bool get hasData => data != null;

  /// Анхны ачаалалт — өгөгдөл хараахан байхгүй байхад л дугуй эргэлдүүлнэ.
  bool get isFirstLoad => (isLoading || isIdle) && !hasData;

  AsyncState<T> toRefreshing() {
    final current = data;
    if (current == null) return const AsyncState.loading();
    return AsyncState<T>.refreshing(current);
  }
}
