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

  /// Дуу бичлэгийн өргөтгөлүүд — [allowedExtensions]-ийн дэд олонлог.
  static const Set<String> audioExtensions = <String>{
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
    ApiException? uploadError;
    try {
      await _uploadFiles(
        messageId: messageId,
        files: files,
        onProgress: onProgress,
      );
    } on ApiException catch (e) {
      uploadError = e;
    }

    // 3. Баталгаажуулалт — оруулалт бүтэлгүйтсэн ч ЗААВАЛ дуудна.
    //
    // Дуудахгүй бол `'P'` (хүлээгдэж буй) төлөвтэй хоосон мессеж илгээгчийн
    // түүхэнд мөнхөд үлдэнэ. Нэг ч файл буугаагүй бол сервер өөрөө тэр мөрийг
    // устгадаг (ChatController.js) — тиймээс энэ дуудлага цэвэрлэгээ ч хийнэ.
    final committed = await _api.legacyObject(
      '/api/Chat/CommitMessage',
      body: <String, dynamic>{
        'MessageId': messageId,
        'ClientMsgId': clientMsgId,
      },
    );
    if (uploadError != null) throw uploadError;
    return ChatMessage.fromJson(committed, me: me);
  }

  /// `/api/BaseObject/uploadFile` — вебийн `BaseCrudHelper.BaseUploadFile`-тэй
  /// яг ижил хэлбэрээр: бүх файлыг **нэг хүсэлтэд**, `File{i}` ба `File{i}Info`
  /// хос болгон.
  ///
  /// Хоёр шалтгаанаар ингэх ёстой:
  ///  * `File{i}Info` дотор `Name` заавал байна. Сервер
  ///    `FileInfo.Name.replace(...)` гэж уншдаг тул хоосон `{}` илгээхэд
  ///    `TypeError` шидэж, formidable-ийн callback дотор залгигдаад хүсэлт
  ///    хэзээ ч хариугүй үлдэж, апп timeout авдаг байв — дуут мессеж ингэж
  ///    илгээгдэхгүй байсан.
  ///  * Сервер талбарыг бүхэлд нь сольдог: хүсэлтэд нэрлэгдээгүй хуучин
  ///    файлыг зөөлөн устгана. Файл бүрийг тусад нь илгээвэл дараагийнх нь
  ///    өмнөхийг устгаж, олон хавсралтаас зөвхөн сүүлийнх нь үлддэг байв.
  Future<void> _uploadFiles({
    required int messageId,
    required List<File> files,
    void Function(int sent, int total)? onProgress,
  }) async {
    final fields = <String, dynamic>{
      'LinkedObjectInfo': jsonEncode(<String, dynamic>{
        'LinkedObjectId': messageId,
        'LinkedObjectName': 'ChatMessages',
        'FieldName': 'Attachment',
      }),
    };
    for (var i = 0; i < files.length; i++) {
      final name = p.basename(files[i].path);
      fields['File$i'] =
          await MultipartFile.fromFile(files[i].path, filename: name);
      // Шинэ файл: `id_data` байхгүй, харин `Name` заавал.
      fields['File${i}Info'] = jsonEncode(<String, dynamic>{'Name': name});
    }

    await _api.upload(
      '/api/BaseObject/uploadFile',
      form: FormData.fromMap(fields),
      onProgress: onProgress,
    );
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

  /// Бүлгийн чат үүсгэх. Сервер үйлчлүүлэгчийг татгалзаж, үүсгэгчийг өөрөө
  /// гишүүн болгоно (`CreateGroupRoom`).
  Future<int> createGroupRoom({
    required String name,
    required List<DirectoryPerson> members,
  }) async {
    final data = await _api.legacyObject(
      '/api/Chat/CreateGroupRoom',
      body: <String, dynamic>{
        'RoomName': name.trim(),
        'Members': <Map<String, dynamic>>[
          for (final DirectoryPerson m in members)
            <String, dynamic>{'UserId': m.userId, 'UserType': m.userType},
        ],
      },
    );
    return (data['ChatRoomId'] as num?)?.toInt() ?? 0;
  }

  /// Өрөөний гишүүд — хасагдсан хүмүүс ч орно, [ChatMember.isActive]-ээр ялгана.
  Future<List<ChatMember>> roomMembers(int chatRoomId) async {
    final rows = await _api.legacyList(
      '/api/Chat/GetChatRoomUsers',
      body: <String, dynamic>{'ChatRoomId': chatRoomId},
    );
    return rows.map(ChatMember.fromJson).toList(growable: false);
  }

  /// Бүлэгт гишүүн нэмэх. Серверийн мессежийг буцаана — "нэмлээ" эсвэл
  /// өмнө хасагдсан хүн бол "дахин нэмлээ".
  Future<String> addMember({
    required int chatRoomId,
    required DirectoryPerson person,
  }) {
    return _legacyMessage(
      '/api/Chat/AddUserToChatRoom',
      <String, dynamic>{
        'ChatRoomId': chatRoomId,
        'UserId': person.userId,
        'UserType': person.userType,
      },
      fallback: 'Хэрэглэгчийг нэмлээ',
    );
  }

  /// Бүлгээс гишүүн хасах. Бусдыг хасах эрх зөвхөн үүсгэгчид (серверийн бодлого).
  Future<String> removeMember({
    required int chatRoomId,
    required ChatMember member,
  }) {
    return _legacyMessage(
      '/api/Chat/RemoveUserFromChatRoom',
      <String, dynamic>{
        'ChatRoomId': chatRoomId,
        'UserId': member.userId,
        'UserType': member.userType,
      },
      fallback: 'Хэрэглэгчийг хаслаа',
    );
  }

  Future<String> _legacyMessage(
    String path,
    Map<String, dynamic> body, {
    required String fallback,
  }) async {
    final response = await _api.legacyResponse(path, body: body);
    return Envelope.messageOf(response.data, fallback: fallback);
  }

  /// Эмчийн лавлахын шүүлтүүр — аймаг, сумын жагсаалт тоотойгоо.
  ///
  /// Үйлчлүүлэгчид сервер хоосон жагсаалт буцаадаг (серверийн бодлого).
  Future<DirectoryFilters> directoryFilters() async {
    final data = await _api.legacyObject('/api/Chat/GetDirectoryFilters');
    return DirectoryFilters(
      provinces: Envelope.asList(data['Provinces'])
          .map(DirectoryPlace.fromJson)
          .toList(growable: false),
      soums: Envelope.asList(data['Soums'])
          .map(DirectoryPlace.fromJson)
          .toList(growable: false),
    );
  }

  /// Эмчийн лавлах, хуудаслалттай. Үйлчлүүлэгчийн хайлт нь өөрийг нь эмчилж
  /// буй багаар хязгаарлагдана (серверийн бодлого).
  ///
  /// Аймаг, сумыг **нэрээр** илгээнэ, ID-гаар биш: өгөгдөл дотор ID ба нэр
  /// зөрдөг (`addr_prov_city = 10` нь Дундговь, гэвч мөрүүд дээр
  /// `ProvCityName = 'Улаанбаатар'`). Серверийн `SearchUsers` мөн нэрээр шүүдэг.
  Future<DirectoryPage> searchDoctors({
    String search = '',
    String? provinceName,
    String? soumName,
    int pageNumber = 0,
    int pageSize = 50,
  }) async {
    final response = await _api.legacyResponse(
      '/api/Chat/SearchUsers',
      body: <String, dynamic>{
        'SearchText': search.trim(),
        'PageNumber': pageNumber,
        'PageSize': pageSize.clamp(1, 50),
        'ProvinceName': provinceName ?? '',
        'SoumName': soumName ?? '',
      },
    );

    final body = Envelope.asMap(response.data);
    final people = Envelope.asList(body['Data'])
        .map(DirectoryPerson.fromJson)
        .toList(growable: false);
    final rawTotal = Envelope.asMap(body['Option'])['Total'];
    final total = rawTotal is num
        ? rawTotal.toInt()
        : int.tryParse('$rawTotal') ?? people.length;

    return DirectoryPage(people: people, total: total);
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
