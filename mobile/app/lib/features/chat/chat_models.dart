import '../../core/util/json_read.dart';

/// Чатын танигч — `{UserType, UserId}`.
///
/// Үүнийг клиент тал **өөрөө тооцоолж чадахгүй**. Ажилтны хувьд `LogedUser.Id`
/// -тэй тохирдог ч үйлчлүүлэгчийн хувьд `UserId` нь `Patient.id_data` бөгөөд
/// нэвтэрсэн бүртгэл нь `PatientUsers` мөр — өөр хүснэгтүүд. Тиймээс сервер
/// `GetChatRoomList`-ийн `Option.Me` дотор өөрийг нь буцаадаг бөгөөд "энэ
/// мессеж минийх үү" гэдгийг зөвхөн түүгээр шийднэ.
class ChatMe {
  const ChatMe({required this.userType, required this.userId});

  final String userType;
  final int userId;

  bool matches(String? type, int? id) =>
      id != null && userId == id && userType == (type ?? userType);

  factory ChatMe.fromJson(Map<String, dynamic> json) => ChatMe(
        userType: J.strOr(json, <String>['UserType'], fallback: 'P'),
        userId: J.intOf(json, <String>['UserId']) ?? 0,
      );
}

/// Өрөөний гишүүн.
class ChatMember {
  const ChatMember({
    required this.userType,
    required this.userId,
    required this.name,
    this.imageSrc,
    this.roleId,
    this.organizationName,
    this.profession,
    this.isMe = false,
    this.isActive = true,
  });

  final String userType;
  final int userId;
  final String name;
  final String? imageSrc;
  final int? roleId;
  final String? organizationName;
  final String? profession;
  final bool isMe;

  /// `GetChatRoomUsers` хасагдсан гишүүдийг ч буцаадаг (`IsActive = '0'`).
  final bool isActive;

  String get key => '$userType-$userId';

  factory ChatMember.fromJson(Map<String, dynamic> json) {
    // `GetChatRoomList`-ийн гишүүдэд `IsActive` байхгүй — тэд бүгд идэвхтэй.
    final active = json['IsActive'];
    return ChatMember(
      userType: J.strOr(json, <String>['UserType'], fallback: 'S'),
      userId: J.intOf(json, <String>['UserId']) ?? 0,
      name: J.strOr(json, <String>['Name']),
      imageSrc: J.str(json, <String>['ImageSrc']),
      roleId: J.intOf(json, <String>['RoleId']),
      organizationName: J.str(json, <String>['OrganizationName']),
      profession: J.str(json, <String>['profession']),
      isMe: J.boolOf(json, <String>['IsMe']),
      isActive: active == null || active == true || '$active' == '1',
    );
  }
}

/// Сүүлийн мессежийн товч.
class ChatLastMessage {
  const ChatLastMessage({
    required this.id,
    required this.text,
    this.createDate,
    this.attachmentCount = 0,
    this.isMine = false,
  });

  final int id;
  final String text;
  final DateTime? createDate;
  final int attachmentCount;
  final bool isMine;

  /// Жагсаалтад харагдах богино тайлбар.
  String get preview {
    final trimmed = text.trim();
    if (trimmed.isNotEmpty) return trimmed;
    if (attachmentCount > 0) return 'Хавсралт илгээсэн';
    return '';
  }

  factory ChatLastMessage.fromJson(Map<String, dynamic> json) =>
      ChatLastMessage(
        id: J.intOf(json, <String>['Id']) ?? 0,
        text: J.strOr(json, <String>['MessageText']),
        createDate: J.date(json, <String>['CreateDate']),
        attachmentCount: J.intOf(json, <String>['AttachmentCount']) ?? 0,
        isMine: J.boolOf(json, <String>['IsMine']),
      );
}

/// Чатын өрөө.
class ChatRoom {
  const ChatRoom({
    required this.chatRoomId,
    required this.name,
    required this.roomType,
    this.members = const <ChatMember>[],
    this.unreadCount = 0,
    this.lastMessage,
    this.lastActivityDate,
    this.isMuted = false,
  });

  final int chatRoomId;
  final String name;
  final String roomType;
  final List<ChatMember> members;
  final int unreadCount;
  final ChatLastMessage? lastMessage;
  final DateTime? lastActivityDate;
  final bool isMuted;

  bool get isGroup => roomType == 'GR';

  /// 1:1 өрөөний нөгөө хүн.
  ChatMember? get counterpart {
    for (final m in members) {
      if (!m.isMe) return m;
    }
    return null;
  }

  String get displayName {
    if (name.trim().isNotEmpty) return name.trim();
    return counterpart?.name ?? 'Чат';
  }

  ChatRoom copyWith({
    int? unreadCount,
    ChatLastMessage? lastMessage,
    DateTime? lastActivityDate,
  }) =>
      ChatRoom(
        chatRoomId: chatRoomId,
        name: name,
        roomType: roomType,
        members: members,
        unreadCount: unreadCount ?? this.unreadCount,
        lastMessage: lastMessage ?? this.lastMessage,
        lastActivityDate: lastActivityDate ?? this.lastActivityDate,
        isMuted: isMuted,
      );

  factory ChatRoom.fromJson(Map<String, dynamic> json) {
    final last = J.obj(json, <String>['LastMessage']);
    return ChatRoom(
      chatRoomId: J.intOf(json, <String>['ChatRoomId']) ?? 0,
      name: J.strOr(json, <String>['Name']),
      roomType: J.strOr(json, <String>['RoomType'], fallback: 'DR'),
      members: J
          .list(json, <String>['Members'])
          .map(ChatMember.fromJson)
          .toList(growable: false),
      unreadCount: J.intOf(json, <String>['UnreadCount']) ?? 0,
      lastMessage: last == null ? null : ChatLastMessage.fromJson(last),
      lastActivityDate: J.date(json, <String>['LastActivityDate']),
      isMuted: J.boolOf(json, <String>['IsMuted']),
    );
  }
}

/// Мессежид хавсаргасан файл.
class ChatAttachment {
  const ChatAttachment({
    required this.fileId,
    required this.name,
    this.ext,
    this.thumbnailSrc,
    this.type,
    this.kind,
    this.generatedName,
    this.durationMs,
    this.mediaState,
  });

  final int fileId;
  final String name;
  final String? ext;

  /// `audio` · `video` · `image` · `file`. **Өргөтгөлөөр биш үүгээр салгана**:
  /// `.webm` нь видео, `.weba` нь дуу — контейнер нь ижил (CHAT-MEDIA §2).
  final String? kind;

  /// Сервер дээрх файлын нэр. Хөрвүүлэлтийн дараа ч өөрчлөгддөггүй тул
  /// тоглуулах холбоос, кэшийн түлхүүр болно.
  final String? generatedName;

  /// Бичлэгийн урт (мс). Татахаас өмнө `0:42` гэж харуулна.
  final int? durationMs;

  /// `null` · `pending` · `done` · `failed`. **Хавсралтыг нуух шалтгаан биш** —
  /// `pending` үед эх бичлэг аль хэдийн тоглогдоно.
  final String? mediaState;

  /// Toglуулах, татах зам. Токен нь толгойгоор явна.
  String? get streamUrl {
    final name = (generatedName ?? '').trim();
    if (name.isEmpty) return null;
    return '/api/Media/stream/$name';
  }

  bool get isVideo {
    if ((kind ?? '').toLowerCase() == 'video') return true;
    final e = (ext ?? '').toLowerCase().replaceAll('.', '');
    return const <String>['mp4', 'm4v', 'mov'].contains(e);
  }

  /// Хөрвүүлэлт хийгдэж байгаа — тоглуулахад саад биш.
  bool get isConverting => (mediaState ?? '') == 'pending';

  /// Зурган хавсралтын жижиг урьдчилсан харагдац (base64 data URI).
  final String? thumbnailSrc;

  final String? type;

  bool get isImage {
    if ((kind ?? '').toLowerCase() == 'image') return true;
    final t = (type ?? '').toLowerCase();
    if (t.contains('image')) return true;
    final e = (ext ?? '').toLowerCase().replaceAll('.', '');
    return const <String>['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic']
        .contains(e);
  }

  bool get isAudio {
    if ((kind ?? '').toLowerCase() == 'audio') return true;
    // `kind` ирээгүй хуучин мессежид өргөтгөлөөр таана. `webm` нь видео байж
    // болох тул энд оруулахгүй — түүнийг `kind` шийднэ.
    final e = (ext ?? '').toLowerCase().replaceAll('.', '');
    return const <String>['mp3', 'm4a', 'aac', 'ogg', 'wav', 'weba']
        .contains(e);
  }

  factory ChatAttachment.fromJson(Map<String, dynamic> json) {
    final info = J.obj(json, <String>['FileInfo']) ?? <String, dynamic>{};
    return ChatAttachment(
      fileId: J.intOf(info, <String>['id_data', 'Id']) ?? 0,
      name: J.strOr(
        info,
        <String>['Name', 'original_name'],
        fallback: 'Хавсралт',
      ),
      ext: J.str(info, <String>['ext']),
      thumbnailSrc: J.str(json, <String>['FileSrc']),
      type: J.str(json, <String>['Type']),
      kind: J.str(json, <String>['Kind']) ?? J.str(info, <String>['Kind']),
      generatedName: J.str(info, <String>['generated_name', 'GeneratedName']),
      durationMs: J.intOf(json, <String>['DurationMs']) ??
          J.intOf(info, <String>['DurationMs', 'duration_ms']),
      mediaState: J.str(json, <String>['MediaState']) ??
          J.str(info, <String>['MediaState', 'media_state']),
    );
  }
}

/// Мессежийн илгээх төлөв — өөдрөг (optimistic) UI-д.
enum ChatSendState { sent, sending, failed }

/// Нэг мессеж.
class ChatMessage {
  const ChatMessage({
    required this.id,
    required this.chatRoomId,
    required this.text,
    required this.isMine,
    this.userType,
    this.userId,
    this.senderName = '',
    this.createDate,
    this.status = 'S',
    this.attachmentCount = 0,
    this.attachments = const <ChatAttachment>[],
    this.clientMsgId,
    this.sendState = ChatSendState.sent,
  });

  final int id;
  final int chatRoomId;
  final String text;
  final bool isMine;
  final String? userType;
  final int? userId;
  final String senderName;
  final DateTime? createDate;

  /// `'S'` илгээгдсэн, `'P'` хавсралт хүлээгдэж буй.
  final String status;

  final int attachmentCount;
  final List<ChatAttachment> attachments;
  final String? clientMsgId;
  final ChatSendState sendState;

  bool get isPending => status == 'P';
  bool get hasAttachments => attachmentCount > 0 || attachments.isNotEmpty;

  ChatMessage copyWith({
    int? id,
    ChatSendState? sendState,
    String? status,
    List<ChatAttachment>? attachments,
    int? attachmentCount,
    DateTime? createDate,
  }) =>
      ChatMessage(
        id: id ?? this.id,
        chatRoomId: chatRoomId,
        text: text,
        isMine: isMine,
        userType: userType,
        userId: userId,
        senderName: senderName,
        createDate: createDate ?? this.createDate,
        status: status ?? this.status,
        attachmentCount: attachmentCount ?? this.attachmentCount,
        attachments: attachments ?? this.attachments,
        clientMsgId: clientMsgId,
        sendState: sendState ?? this.sendState,
      );

  factory ChatMessage.fromJson(Map<String, dynamic> json, {ChatMe? me}) {
    final userType = J.str(json, <String>['UserType']);
    final userId = J.intOf(json, <String>['UserId']);

    // Сервер `IsMine`-ыг хүлээн авагч бүрээр тооцож өгдөг, гэхдээ socket-оор
    // тархах payload дээр байхгүй (тэнд бүх хүнд нэг payload очдог) — тиймээс
    // өөрийн танигчаар нөхөж тооцно.
    final serverIsMine = json['IsMine'];
    final isMine = serverIsMine is bool
        ? serverIsMine
        : (me?.matches(userType, userId) ?? false);

    return ChatMessage(
      id: J.intOf(json, <String>['Id']) ?? 0,
      chatRoomId: J.intOf(json, <String>['ChatRoomId']) ?? 0,
      text: J.strOr(json, <String>['MessageText']),
      isMine: isMine,
      userType: userType,
      userId: userId,
      senderName: J.strOr(json, <String>['SenderName']),
      createDate: J.date(json, <String>['CreateDate']),
      status: J.strOr(json, <String>['Status'], fallback: 'S'),
      attachmentCount: J.intOf(json, <String>['AttachmentCount']) ?? 0,
      attachments: J
          .list(json, <String>['Attachment'])
          .map(ChatAttachment.fromJson)
          .toList(growable: false),
      clientMsgId: J.str(json, <String>['ClientMsgId']),
    );
  }
}

/// Эмчийн лавлахын нэг мөр.
///
/// Үйлчлүүлэгч хайхад сервер имэйл, утсыг **зориудаар хасдаг** — эмчийн нэр,
/// ажлын газар нээлттэй, харилцах хаяг нь биш.
class DirectoryPerson {
  const DirectoryPerson({
    required this.userType,
    required this.userId,
    required this.name,
    this.profession,
    this.position,
    this.organizationName,
    this.provCityName,
    this.soumDistName,
    this.imageSrc,
  });

  final String userType;
  final int userId;
  final String name;
  final String? profession;
  final String? position;
  final String? organizationName;
  final String? provCityName;
  final String? soumDistName;
  final String? imageSrc;

  /// Хүнийг ялгах түлхүүр — эмч, үйлчлүүлэгчийн ID өөр хүснэгтээс ирдэг тул
  /// дугаар дангаараа давхцаж болно.
  String get key => '$userType-$userId';

  String get subtitle {
    final parts = <String>[
      if ((profession ?? '').trim().isNotEmpty) profession!.trim(),
      if ((organizationName ?? '').trim().isNotEmpty) organizationName!.trim(),
      // Вебийн `DoctorPicker`-тэй ижил дараалал: мэргэжил · байгууллага · сум ·
      // аймаг. Шүүлтүүрээр хайсан хүн тэр газрыг мөрөн дээрээ харах ёстой.
      if ((soumDistName ?? '').trim().isNotEmpty) soumDistName!.trim(),
      if ((provCityName ?? '').trim().isNotEmpty) provCityName!.trim(),
    ];
    return parts.join(' · ');
  }

  factory DirectoryPerson.fromJson(Map<String, dynamic> json) =>
      DirectoryPerson(
        userType: J.strOr(json, <String>['UserType'], fallback: 'S'),
        userId: J.intOf(json, <String>['UserId']) ?? 0,
        name: J.strOr(json, <String>['Name', 'FullName'], fallback: 'Эмч'),
        profession: J.str(json, <String>['profession']),
        position: J.str(json, <String>['position']),
        organizationName: J.str(json, <String>['OrganizationName']),
        provCityName: J.str(json, <String>['ProvCityName']),
        soumDistName: J.str(json, <String>['SoumDistName']),
        imageSrc: J.str(json, <String>['ImageSrc']),
      );
}

/// Лавлахын нэг хуудас — `SearchUsers`-ийн `Data` ба `Option.Total`.
class DirectoryPage {
  const DirectoryPage({required this.people, required this.total});

  final List<DirectoryPerson> people;
  final int total;
}

/// Аймаг эсвэл сум, доторх эмчийн тоотой нь — `GetDirectoryFilters`.
class DirectoryPlace {
  const DirectoryPlace({
    required this.name,
    required this.count,
    this.provinceName,
  });

  final String name;
  final int count;

  /// Зөвхөн сумд. Сумын нэр аймаг хооронд давхцдаг тул аль аймгийнх болохыг
  /// хадгална.
  final String? provinceName;

  /// Вебийнх шиг: "Улаанбаатар (646)".
  String get label => '$name ($count)';

  factory DirectoryPlace.fromJson(Map<String, dynamic> json) => DirectoryPlace(
        name: J.strOr(json, <String>['Name'], fallback: ''),
        count: J.intOf(json, <String>['Count']) ?? 0,
        provinceName: J.str(json, <String>['ProvinceName']),
      );
}

/// Лавлахын шүүлтүүрийн жагсаалтууд.
///
/// Эмч байгаа газруудаас л бүтдэг (22 аймаг, 342 сумыг бүгдийг биш), тиймээс
/// сонголт бүр дор хаяж нэг эмч рүү хөтөлнө.
class DirectoryFilters {
  const DirectoryFilters({required this.provinces, required this.soums});

  static const DirectoryFilters empty = DirectoryFilters(
    provinces: <DirectoryPlace>[],
    soums: <DirectoryPlace>[],
  );

  final List<DirectoryPlace> provinces;
  final List<DirectoryPlace> soums;

  /// Үйлчлүүлэгчид сервер хоосон жагсаалт буцаадаг — тэдний лавлах нь өөрийн
  /// эмчилгээний баг тул улсын хэмжээний шүүлтүүр утгагүй.
  bool get isEmpty => provinces.isEmpty;

  List<DirectoryPlace> soumsOf(String province) => soums
      .where((DirectoryPlace s) => s.provinceName == province)
      .toList(growable: false);
}
