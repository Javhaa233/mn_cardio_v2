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
    this.isMe = false,
  });

  final String userType;
  final int userId;
  final String name;
  final String? imageSrc;
  final int? roleId;
  final String? organizationName;
  final bool isMe;

  factory ChatMember.fromJson(Map<String, dynamic> json) => ChatMember(
        userType: J.strOr(json, <String>['UserType'], fallback: 'S'),
        userId: J.intOf(json, <String>['UserId']) ?? 0,
        name: J.strOr(json, <String>['Name']),
        imageSrc: J.str(json, <String>['ImageSrc']),
        roleId: J.intOf(json, <String>['RoleId']),
        organizationName: J.str(json, <String>['OrganizationName']),
        isMe: J.boolOf(json, <String>['IsMe']),
      );
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
  });

  final int fileId;
  final String name;
  final String? ext;

  /// Зурган хавсралтын жижиг урьдчилсан харагдац (base64 data URI).
  final String? thumbnailSrc;

  final String? type;

  bool get isImage {
    final t = (type ?? '').toLowerCase();
    if (t.contains('image')) return true;
    final e = (ext ?? '').toLowerCase().replaceAll('.', '');
    return const <String>['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic']
        .contains(e);
  }

  bool get isAudio {
    final e = (ext ?? '').toLowerCase().replaceAll('.', '');
    return const <String>['mp3', 'm4a', 'aac', 'ogg', 'wav', 'webm']
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
    this.imageSrc,
  });

  final String userType;
  final int userId;
  final String name;
  final String? profession;
  final String? position;
  final String? organizationName;
  final String? provCityName;
  final String? imageSrc;

  String get subtitle {
    final parts = <String>[
      if ((profession ?? '').trim().isNotEmpty) profession!.trim(),
      if ((organizationName ?? '').trim().isNotEmpty) organizationName!.trim(),
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
        imageSrc: J.str(json, <String>['ImageSrc']),
      );
}
