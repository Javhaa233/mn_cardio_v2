import 'dart:io';

import 'package:flutter/material.dart';
import 'package:open_filex/open_filex.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/util/json_read.dart';
import '../../core/util/mn_format.dart';
import 'app_snack.dart';
import 'media_views.dart';

/// Асуулт, хариун дээрх нэг хавсралт — API.md §9.4.
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
  });

  final int id;
  final String name;
  final String? ext;
  final int? size;
  final String? url;

  bool get isImage {
    final e = (ext ?? p.extension(name)).toLowerCase().replaceAll('.', '');
    return const <String>['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic']
        .contains(e);
  }

  bool get isAudio {
    final e = (ext ?? p.extension(name)).toLowerCase().replaceAll('.', '');
    return const <String>['mp3', 'm4a', 'aac', 'ogg', 'wav', 'weba']
        .contains(e);
  }

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
