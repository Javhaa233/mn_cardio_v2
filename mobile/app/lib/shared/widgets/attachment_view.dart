import 'dart:io';

import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';
import 'package:provider/provider.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/storage/secure_store.dart';
import '../../core/util/json_read.dart';
import '../../core/util/mn_format.dart';
import 'app_snack.dart';
import 'media_views.dart';

/// Асуулт, зөвлөгөө, хариун дээрх нэг хавсралт — API.md §9.4, §6.
///
/// `url` нь `/api/Media/stream/<generated_name>`. Замыг өөрсдөө угсрахгүй:
/// сервер юу өгснийг тэр чигээр нь хэрэглэнэ.
class Attachment {
  const Attachment({
    required this.id,
    required this.name,
    this.ext,
    this.size,
    this.url,
    this.kind,
    this.durationMs,
    this.mediaState,
  });

  final int id;
  final String name;
  final String? ext;
  final int? size;
  final String? url;

  /// `audio` · `video` · `image` · `file` — серверийн ангилагчийн хариу.
  final String? kind;

  /// Дуу, видеоны урт. Серверт багана үүсээгүй бол `null` — тэгэхэд `0:00`
  /// биш, зураас харуулна.
  final int? durationMs;

  /// `pending` хөрвүүлж байна · `done` · `failed`.
  final String? mediaState;

  String get _ext => (ext ?? p.extension(name)).toLowerCase().replaceAll('.', '');

  bool get isImage {
    if ((kind ?? '').toLowerCase() == 'image') return true;
    if (kind != null) return false;
    return const <String>['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic']
        .contains(_ext);
  }

  /// `.webm` бол видео, `.weba` бол дуу — яг ижил контейнер, зөвхөн нэрээр
  /// ялгагдана. Тиймээс `kind` ирсэн бол өргөтгөлөөр таамаглахгүй (API.md §6).
  bool get isAudio {
    if ((kind ?? '').toLowerCase() == 'audio') return true;
    if (kind != null) return false;
    return const <String>['mp3', 'm4a', 'aac', 'ogg', 'wav', 'weba']
        .contains(_ext);
  }

  bool get isVideo {
    if ((kind ?? '').toLowerCase() == 'video') return true;
    if (kind != null) return false;
    return const <String>['mp4', 'm4v', 'mov', 'webm'].contains(_ext);
  }

  /// Хөрвүүлэлт дуусаагүй — тоглуулахад саад биш, гэхдээ хэрэглэгчид хэлнэ.
  bool get isConverting => (mediaState ?? '') == 'pending';

  String get fileName {
    final e = (ext ?? '').replaceAll('.', '');
    if (e.isEmpty || name.toLowerCase().endsWith('.$e')) return name;
    return '$name.$e';
  }

  factory Attachment.fromJson(Map<String, dynamic> json) => Attachment(
        id: J.intOf(json, <String>['id', 'Id']) ?? 0,
        name: J.strOr(json, <String>['name', 'Name']),
        ext: J.str(json, <String>['ext', 'Ext']),
        size: J.intOf(json, <String>['size', 'Size']),
        url: J.str(json, <String>['url', 'Url']),
        kind: J.str(json, <String>['kind', 'Kind']),
        durationMs: J.intOf(json, <String>['durationMs', 'DurationMs']),
        mediaState: J.str(json, <String>['mediaState', 'MediaState']),
      );
}

/// Хавсралт.
///
/// Зураг, дуу бичлэгийг **шууд** харуулж, сонсгоно — татаад өөр програмаар
/// нээх шаардлагагүй. Бусад файлыг дарахад татаж нээнэ.
class AttachmentChip extends StatefulWidget {
  const AttachmentChip({
    super.key,
    required this.attachment,
    required this.api,
  });

  final Attachment attachment;
  final ApiClient api;

  @override
  State<AttachmentChip> createState() => _AttachmentChipState();
}

class _AttachmentChipState extends State<AttachmentChip> {
  bool _busy = false;

  IconData get _icon {
    if (widget.attachment.isImage) return Icons.image_outlined;
    if (widget.attachment.isAudio) return Icons.audio_file_outlined;
    return Icons.insert_drive_file_outlined;
  }

  Future<void> _open() async {
    final url = widget.attachment.url;
    if (url == null || url.isEmpty || _busy) return;
    setState(() => _busy = true);
    try {
      final bytes = await widget.api.downloadBytes(url);
      final dir = await getTemporaryDirectory();
      final safe = widget.attachment.fileName
          .replaceAll(RegExp(r'[\\/:*?"<>|]'), '_');
      final file = File(p.join(dir.path, '${widget.attachment.id}_$safe'));
      await file.writeAsBytes(bytes, flush: true);
      final result = await OpenFilex.open(file.path);
      if (!mounted) return;
      if (result.type != ResultType.done) {
        AppSnack.info(context, 'Энэ төрлийн файлыг нээх апп олдсонгүй.');
      }
    } on ApiException catch (e) {
      if (mounted) AppSnack.error(context, e.message);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  /// Видеог урсгалаар тоглуулна — бүтнээр нь татахгүй. Токеныг толгойгоор
  /// өгөх тул урьдчилан уншина.
  Future<void> _openVideo(String url) async {
    final token = await context.read<SecureStore>().readAccessToken();
    if (!mounted) return;
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => VideoMessageScreen(
          api: widget.api,
          url: url,
          token: token,
          title: widget.attachment.fileName,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final size = widget.attachment.size;
    final url = widget.attachment.url;

    if (url != null && widget.attachment.isImage) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: GestureDetector(
          onTap: () => Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => FullScreenImage(
                api: widget.api,
                url: url,
                title: widget.attachment.fileName,
              ),
            ),
          ),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 230, maxHeight: 260),
            child: AuthedImage(api: widget.api, url: url, width: 230),
          ),
        ),
      );
    }

    if (url != null && widget.attachment.isAudio) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 2),
        child: AudioMessagePlayer(
          api: widget.api,
          url: url,
          fileName: widget.attachment.fileName,
          durationMs: widget.attachment.durationMs,
        ),
      );
    }

    if (url != null && widget.attachment.isVideo) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: OutlinedButton.icon(
          onPressed: () => _openVideo(url),
          icon: const Icon(Icons.play_circle_fill_rounded, size: 20),
          label: const Text('Видео үзэх'),
        ),
      );
    }

    return InkWell(
      onTap: _open,
      borderRadius: BorderRadius.circular(10),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 4),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            if (_busy)
              const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2),
              )
            else
              Icon(_icon, size: 18, color: theme.colorScheme.primary),
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                widget.attachment.fileName,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.bodySmall,
              ),
            ),
            if (size != null) ...<Widget>[
              const SizedBox(width: 6),
              Text(
                MnFormat.fileSize(size),
                style: theme.textTheme.bodySmall?.copyWith(fontSize: 11),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
