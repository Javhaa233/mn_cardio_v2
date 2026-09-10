import 'dart:convert';
import 'dart:io';

import 'package:dio/dio.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import 'chat_models.dart';

/// Өрөөний жагсаалт ба өөрийн танигч хамт.
class ChatRoomListResult {
  const ChatRoomListResult({required this.rooms, this.me});

  final List<ChatRoom> rooms;
  final ChatMe? me;
}

/// Чат — хуучин давхаргын PascalCase дугтуйтай, гэхдээ мобайлд бүрэн бэлэн
/// цорын ганц гадаргуу (API.md §5). Текст, зураг, дуу бичлэг, баримт бичиг
/// бүгд дэмжигдэнэ.
class ChatRepository {
  ChatRepository(this._api);

  final ApiClient _api;

  /// Апп даяар зөвшөөрөгдсөн өргөтгөлүүд (`BaseController.js:278-301`).
  ///
  /// Сервер энэ жагсаалтад байхгүй өргөтгөлийг шууд татгалздаг бөгөөд алдаа нь
  /// **HTTP 200**-оор ирнэ. Тиймээс илгээхээс өмнө клиент талд шалгана.
  /// Видео өргөтгөл жагсаалтад **байхгүй** гэдгийг анзаараарай.
  static const Set<String> allowedExtensions = <String>{
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic',
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv', 'dcm',
    'mp3', 'm4a', 'aac', 'ogg', 'wav', 'webm',
  };

  /// Чатын хавсралтын дээд хэмжээ 50 МБ (бусад газар 10 МБ).
  static const int maxAttachmentBytes = 50 * 1024 * 1024;

  static bool isAllowedFile(String path) {
    final ext = p.extension(path).replaceAll('.', '').toLowerCase();
    return allowedExtensions.contains(ext);
  }

  Future<ChatRoomListResult> fetchRooms() async {
    final response = await _api.legacyResponse('/api/Chat/GetChatRoomList');
    final body = Envelope.asMap(response.data);
    final option = Envelope.asMap(body['Option']);
    final meJson = Envelope.asMap(option['Me']);

    return ChatRoomListResult(
      rooms: Envelope.asList(body['Data'])
          .map(ChatRoom.fromJson)
          .toList(growable: false),
      me: meJson.isEmpty ? null : ChatMe.fromJson(meJson),
    );
  }

  /// Мессежүүд. **Keyset хуудаслалт** — хуудасны дугаар биш [beforeId] ашиглана.
  ///
  /// Шалтгаан: яриа үргэлжилж байхад OFFSET бүх мөрийг доош шилжүүлж, нэг
  /// мессежийг хоёр удаа эсвэл огт үзүүлэхгүй байх эрсдэлтэй.
  Future<List<ChatMessage>> fetchMessages({
    required int chatRoomId,
    int pageSize = 30,
    int? beforeId,
    ChatMe? me,
  }) async {
    final rows = await _api.legacyList(
      '/api/Chat/GetMessages',
      body: <String, dynamic>{
        'ChatRoomId': chatRoomId,
        'PageSize': pageSize.clamp(1, 50),
        if (beforeId != null) 'BeforeId': beforeId,
      },
    );
    return rows
        .map((Map<String, dynamic> row) => ChatMessage.fromJson(row, me: me))
        .toList(growable: false);
  }

  Future<ChatMessage> sendText({
    required int chatRoomId,
    required String text,
    required String clientMsgId,
    ChatMe? me,
  }) async {
    final data = await _api.legacyObject(
      '/api/Chat/SendMessage',
      body: <String, dynamic>{
        'ChatRoomId': chatRoomId,
        'MessageText': text,
        'HasAttachment': false,
        'ClientMsgId': clientMsgId,
      },
    );
    return ChatMessage.fromJson(data, me: me);
  }

  /// Хавсралттай мессеж илгээх нь **гурван алхам**, дарааллаараа:
  ///
  /// 1. `SendMessage(HasAttachment: true)` → `Status: 'P'` мөр үүснэ. Хэн ч
  ///    хараахан харахгүй.
  /// 2. `uploadFile` → файлууд диск дээр бууна.
  /// 3. `CommitMessage` → мессеж илгээгдсэн болж, socket-оор тархана.
  ///
  /// Гурав дахь алхмыг алгасвал мессеж хэнд ч хүрэхгүй. Файл нэг ч буугаагүй
  /// бол сервер тээвэрлэгч мөрийг устгана — хоосон бөмбөлөг үлдэхгүй.
  Future<ChatMessage> sendWithAttachment({
    required int chatRoomId,
    required String text,
    required String clientMsgId,
    required List<File> files,
    ChatMe? me,
    void Function(int sent, int total)? onProgress,
  }) async {
    for (final file in files) {
      if (!isAllowedFile(file.path)) {
        throw ApiException(
          'Энэ төрлийн файл дэмжигдэхгүй байна: '
          '${p.extension(file.path).replaceAll('.', '')}',
        );
      }
      if (await file.length() > maxAttachmentBytes) {
        throw ApiException('Файлын хэмжээ 50 МБ-аас хэтэрсэн байна.');
      }
    }

    // 1. Тээвэрлэгч мессеж.
    final created = await _api.legacyObject(
      '/api/Chat/SendMessage',
      body: <String, dynamic>{
        'ChatRoomId': chatRoomId,
        'MessageText': text,
        'HasAttachment': true,
        'ClientMsgId': clientMsgId,
      },
    );
    final messageId = (created['Id'] as num?)?.toInt() ?? 0;
    if (messageId == 0) {
      throw ApiException('Мессеж үүсгэж чадсангүй.');
    }

    // 2. Файлууд.
    await _uploadFiles(messageId: messageId, files: files, onProgress: onProgress);

    // 3. Баталгаажуулалт.
    final committed = await _api.legacyObject(
      '/api/Chat/CommitMessage',
      body: <String, dynamic>{
        'MessageId': messageId,
        'ClientMsgId': clientMsgId,
      },
    );
    return ChatMessage.fromJson(committed, me: me);
  }

  /// `/api/BaseObject/uploadFile` нь браузерын файл оруулах талбарын хэлбэрийг
  /// дуурайдаг тул Dart талд нарийн угсралт шаардана (API.md §7).
  ///
  /// **Талбар бүрд `<Field>Info` дагалдах хэсэг заавал байна.** Дутуу орхивол
  /// өмнө байсан файл зөөлөн устгагдана — вэб маягт устгах дохиогоо ингэж
  /// өгдөг.
  Future<void> _uploadFiles({
    required int messageId,
    required List<File> files,
    void Function(int sent, int total)? onProgress,
  }) async {
    for (final file in files) {
      final form = FormData.fromMap(<String, dynamic>{
        'LinkedObjectInfo': jsonEncode(<String, dynamic>{
          'LinkedObjectId': messageId,
          'LinkedObjectName': 'ChatMessages',
          'FieldName': 'Attachment',
        }),
        // Хоосон объект = шинэ файл. `{id_data: ...}` бол байгааг нь хадгална.
        'AttachmentInfo': jsonEncode(<String, dynamic>{}),
        'Attachment': await MultipartFile.fromFile(
          file.path,
          filename: p.basename(file.path),
        ),
      });

      await _api.upload(
        '/api/BaseObject/uploadFile',
        form: form,
        onProgress: onProgress,
      );
    }
  }

  Future<void> markRead({
    required int chatRoomId,
    required int lastMessageId,
  }) async {
    await _api.legacy(
      '/api/Chat/MarkRead',
      body: <String, dynamic>{
        'ChatRoomId': chatRoomId,
        'LastMessageId': lastMessageId,
      },
    );
  }

  Future<int> unreadCount() async {
    final data = await _api.legacy('/api/Chat/GetUnreadCount');
    if (data is num) return data.toInt();
    if (data is Map) {
      final value = data['UnreadCount'] ?? data['Total'] ?? data['Count'];
      if (value is num) return value.toInt();
    }
    return 0;
  }

  /// 1:1 өрөө нээх. Давхар дуудахад шинэ өрөө үүсгэхгүй.
  Future<int> startChat({
    required String userType,
    required int userId,
  }) async {
    final data = await _api.legacyObject(
      '/api/Chat/StartChat',
      body: <String, dynamic>{'UserType': userType, 'UserId': userId},
    );
    return (data['ChatRoomId'] as num?)?.toInt() ??
        (data['Id'] as num?)?.toInt() ??
        0;
  }

  /// Эмчийн лавлах. Үйлчлүүлэгчийн хайлт нь өөрийг нь эмчилж буй багаар
  /// хязгаарлагдана (серверийн бодлого).
  Future<List<DirectoryPerson>> searchDoctors({
    String search = '',
    int pageNumber = 0,
    int pageSize = 30,
  }) async {
    final rows = await _api.legacyList(
      '/api/Chat/SearchUsers',
      body: <String, dynamic>{
        'SearchText': search.trim(),
        'PageNumber': pageNumber,
        'PageSize': pageSize.clamp(1, 50),
      },
    );
    return rows.map(DirectoryPerson.fromJson).toList(growable: false);
  }

  /// Хавсралт татах.
  ///
  /// Амжилттай үед сервер **түүхий байт** буцаана, амжилтгүй үед JSON дугтуй
  /// (HTTP 200-тай) буцаана — тиймээс хариуны төрлийг гараар салгана.
  ///
  /// Ерөнхий `/api/BaseObject/downloadFile`-ыг **хэрэглэхгүй**: тэнд эзэмшлийн
  /// шалгалт огт байхгүй (API.md §7).
  Future<File> downloadAttachment({
    required int fileId,
    required String fileName,
  }) async {
    final response = await _api.raw.post<List<int>>(
      '/api/Chat/DownloadAttachment',
      data: <String, dynamic>{'FileId': fileId},
      options: Options(
        responseType: ResponseType.bytes,
        // Дугтуйн шалгалт байт дээр ажиллахгүй тул энд өөрсдөө шалгана.
        validateStatus: (int? status) => status != null && status < 500,
      ),
    );

    final contentType =
        (response.headers.value('content-type') ?? '').toLowerCase();
    final bytes = response.data ?? const <int>[];

    if (contentType.contains('application/json')) {
      // Алдааны дугтуй байт хэлбэрээр ирлээ.
      try {
        final decoded = jsonDecode(utf8.decode(bytes));
        final failure = envelopeFailureOf(decoded, statusCode: response.statusCode);
        if (failure != null) throw failure;
      } on FormatException {
        // Задлах боломжгүй — доорх ерөнхий алдаа руу унана.
      }
      throw ApiException('Файлыг татаж чадсангүй.');
    }

    if (bytes.isEmpty) {
      throw ApiException('Файл хоосон байна.');
    }

    final dir = await getTemporaryDirectory();
    final safeName = fileName.replaceAll(RegExp(r'[\\/:*?"<>|]'), '_');
    final target = File(p.join(dir.path, '${fileId}_$safeName'));
    await target.writeAsBytes(bytes, flush: true);
    return target;
  }
}
