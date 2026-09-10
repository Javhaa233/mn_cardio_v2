/// Кирилл үсэг агуулж байгаа эсэх.
///
/// Backend-ийн ихэнх мессеж монгол боловч зарим хуучин хяналтууд англи текст
/// буцаадаг (жишээ нь нэвтрэлтийн "There is a user who is not logged into the
/// system"). Техникийн шаардлага §1.3.11-ийн дагуу хэрэглэгчид англи мөр
/// харагдаж болохгүй тул серверийн мессежийг харуулахын өмнө шалгана.
bool isMongolianText(String value) {
  for (final rune in value.runes) {
    // Кирилл (U+0400 – U+04FF), монгол өргөтгөлүүд Ө/Ү үүнд багтана.
    if (rune >= 0x0400 && rune <= 0x04FF) return true;
  }
  return false;
}

/// Серверийн мессежийг зөвхөн монгол байвал харуулна, эсрэг тохиолдолд
/// апп-ын өөрийн монгол текстээр орлуулна.
String mnMessage(String? serverMessage, String fallback) {
  final value = serverMessage?.trim() ?? '';
  if (value.isEmpty) return fallback;
  if (!isMongolianText(value)) return fallback;
  return value;
}
