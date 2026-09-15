import 'dart:collection';
import 'dart:io';
import 'dart:typed_data';

import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../network/api_client.dart';

/// Эрхийн шалгалттай медиаг нэг удаа татаж, дахин ашиглана.
///
/// `/api/Media/stream/<generated_name>` нь токеныг **толгойгоор** шаарддаг тул
/// `Image.network`, `AudioSource.uri` зэрэг энгийн зам ажиллахгүй. Энд байтыг
/// нь татаад санах ойд (зураг) эсвэл түр файлд (дуу, видео) хадгална.
///
/// `generated_name` хөрвүүлэлтийн дараа ч **өөрчлөгддөггүй** тул кэшийн түлхүүр
/// болгож болно (CHAT-MEDIA §3).
class MediaCache {
  MediaCache._();

  static final MediaCache instance = MediaCache._();

  /// Санах ойд барих зургийн дээд хэмжээ. Чатын бөмбөлөгт хэдэн арван зураг
  /// харагдаж болох тул хязгаартай — хамгийн эртнийг нь хаяна.
  static const int _maxBytesInMemory = 24 * 1024 * 1024;

  final LinkedHashMap<String, Uint8List> _memory =
      LinkedHashMap<String, Uint8List>();
  int _memoryBytes = 0;

  final Map<String, Future<Uint8List>> _inFlight = <String, Future<Uint8List>>{};
  final Map<String, File> _files = <String, File>{};

  Uint8List? peek(String url) => _memory[url];

  /// Зураг — санах ойд.
  Future<Uint8List> bytes(ApiClient api, String url) {
    final cached = _memory[url];
    if (cached != null) return Future<Uint8List>.value(cached);

    return _inFlight.putIfAbsent(url, () async {
      try {
        final data = Uint8List.fromList(await api.downloadBytes(url));
        _remember(url, data);
        return data;
      } finally {
        // Хасалт нь Future утга буцаадаг — хүлээх шаардлагагүй.
        // ignore: unawaited_futures
        _inFlight.remove(url);
      }
    });
  }

  /// Дуу, видео — түр файлд. Тоглуулагчид файлын зам хэрэгтэй.
  Future<File> file(ApiClient api, String url, {required String name}) async {
    final existing = _files[url];
    if (existing != null && existing.existsSync()) return existing;

    final data = await api.downloadBytes(url);
    final dir = await getTemporaryDirectory();
    var safe = name.replaceAll(RegExp(r'[\\/:*?"<>|]'), '_');
    // Өргөтгөлгүй файлыг тоглуулагч таньдаггүй (сервер `original_name`-ээс
    // өргөтгөлийг салгаж хадгалдаг). Хаягийн төгсгөлөөс сэргээж үзнэ.
    if (p.extension(safe).isEmpty) {
      final fromUrl = p.extension(Uri.parse(url).path);
      if (fromUrl.isNotEmpty) safe = '$safe$fromUrl';
    }
    final target = File(p.join(dir.path, 'media', safe));
    await target.parent.create(recursive: true);
    await target.writeAsBytes(data, flush: true);
    _files[url] = target;
    return target;
  }

  void _remember(String url, Uint8List data) {
    _memory[url] = data;
    _memoryBytes += data.lengthInBytes;
    while (_memoryBytes > _maxBytesInMemory && _memory.isNotEmpty) {
      final oldest = _memory.keys.first;
      _memoryBytes -= _memory.remove(oldest)?.lengthInBytes ?? 0;
    }
  }
}
