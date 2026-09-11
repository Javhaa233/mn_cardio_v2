import 'dart:async';
import 'dart:io';

import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_exception.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/theme/app_theme.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import '../chat/chat_repository.dart';
import 'doctor_controllers.dart';
import 'doctor_models.dart';
import 'doctor_repository.dart';

/// Шинэ тасалбар — вебийн `customComponents/AdviceFeed/PostComposer.jsx`.
///
/// Вебийнхтэй ижил дөрвөн хэсэг: **иргэн** (тасалбар хэний тухай), **хэлбэр**,
/// **агуулга**, **хавсралт**. "Нийтлэх" нь үүсгээд нэг дор нээдэг тул эмч
/// "нийтэлсэн гэж бодсон ч харагдахгүй" тасалбартай үлдэхгүй; ноорог зөвхөн
/// зохиогчид харагдана.
///
/// Хэнд харагдахыг клиент сонгодоггүй: сервер эмчийн байгууллагын түвшнээр
/// (`level`, аймаг, сум) тогтооно.
class TicketComposerScreen extends StatefulWidget {
  const TicketComposerScreen({super.key});

  @override
  State<TicketComposerScreen> createState() => _TicketComposerScreenState();
}

class _TicketComposerScreenState extends State<TicketComposerScreen> {
  final TextEditingController _body = TextEditingController();
  final List<File> _files = <File>[];

  PatientBrief? _patient;
  List<TicketTypeOption> _types = const <TicketTypeOption>[];
  bool _typesLoading = true;
  String? _typesError;
  String? _type;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _loadTypes();
    });
  }

  @override
  void dispose() {
    _body.dispose();
    super.dispose();
  }

  bool get _dirty =>
      _patient != null ||
      _type != null ||
      _body.text.trim().isNotEmpty ||
      _files.isNotEmpty;

  bool get _canSubmit =>
      !_saving &&
      _patient != null &&
      _type != null &&
      _body.text.trim().isNotEmpty;

  // -------------------------------------------------------------------
  // Өгөгдөл
  // -------------------------------------------------------------------

  Future<void> _loadTypes() async {
    setState(() {
      _typesLoading = true;
      _typesError = null;
    });
    try {
      final types = await context.read<DoctorRepository>().fetchTicketTypes();
      if (!mounted) return;
      setState(() {
        _types = types;
        _typesLoading = false;
        if (types.length == 1) _type = types.first.value;
      });
    } on ApiException catch (e) {
      _typesFailed(e.message);
    } catch (_) {
      _typesFailed('Хэлбэрүүдийг ачаалж чадсангүй.');
    }
  }

  void _typesFailed(String message) {
    if (!mounted) return;
    setState(() {
      _typesLoading = false;
      _typesError = message;
    });
  }

  Future<void> _pickPatient() async {
    final picked = await Navigator.of(context).push<PatientBrief>(
      MaterialPageRoute<PatientBrief>(
        builder: (_) => const _PatientPickerPage(),
      ),
    );
    if (picked != null && mounted) setState(() => _patient = picked);
  }

  Future<void> _addPhoto(ImageSource source) async {
    try {
      final picked = await ImagePicker().pickImage(
        source: source,
        // Харилцааны зураг — эмнэлзүйн нарийвчлалын дүрс биш. Удаан сүлжээнд
        // илгээхэд боломжийн хэмжээ.
        maxWidth: 2000,
        imageQuality: 85,
      );
      if (picked == null) return;
      await _addFile(File(picked.path));
    } catch (_) {
      if (mounted) AppSnack.error(context, 'Зураг сонгож чадсангүй.');
    }
  }

  Future<void> _addDocuments() async {
    try {
      final result = await FilePicker.platform.pickFiles(
        allowMultiple: true,
        type: FileType.custom,
        allowedExtensions: ChatRepository.allowedExtensions.toList(),
      );
      if (result == null) return;
      for (final PlatformFile f in result.files) {
        final path = f.path;
        if (path != null) await _addFile(File(path));
      }
    } catch (_) {
      if (mounted) AppSnack.error(context, 'Файл сонгож чадсангүй.');
    }
  }

  /// Сервер зөвшөөрөөгүй өргөтгөл, 10 МБ-аас том файлыг хадгалахгүй тул
  /// илгээхээс өмнө энд шүүнэ.
  Future<void> _addFile(File file) async {
    if (!ChatRepository.isAllowedFile(file.path)) {
      AppSnack.error(context, 'Энэ төрлийн файлыг хавсаргах боломжгүй.');
      return;
    }
    if (await file.length() > DoctorRepository.maxTicketFileBytes) {
      if (mounted) {
        AppSnack.error(context, 'Файлын хэмжээ 10 МБ-аас хэтэрсэн байна.');
      }
      return;
    }
    if (!mounted) return;
    setState(() => _files.add(file));
  }

  // -------------------------------------------------------------------
  // Хадгалах
  // -------------------------------------------------------------------

  Future<void> _submit({required bool publish}) async {
    final patient = _patient;
    final type = _type;
    if (!_canSubmit || patient == null || type == null) return;
    setState(() => _saving = true);

    final repo = context.read<DoctorRepository>();
    final advice = context.read<DoctorAdviceController>();
    final report = context.read<DoctorReportController>();
    final messenger = ScaffoldMessenger.of(context);
    final navigator = Navigator.of(context);

    try {
      final id = publish
          ? await repo.publishTicket(
              patientId: patient.idData,
              ticketType: type,
              body: _body.text,
            )
          : await repo.saveTicketDraft(
              patientId: patient.idData,
              ticketType: type,
              body: _body.text,
            );
      if (id == 0) throw ApiException('Хадгалж чадсангүй.');

      // Тасалбар аль хэдийн хадгалагдсан. Хавсралт амжилтгүй болсон нь
      // "хадгалж чадсангүй" гэх шалтгаан биш — харин тодорхой анхааруулна.
      String? attachFailure;
      if (_files.isNotEmpty) {
        try {
          await repo.uploadTicketFiles(
            ticketId: id,
            files: List<File>.of(_files),
          );
        } on ApiException catch (e) {
          attachFailure = e.message;
        } catch (_) {
          attachFailure = 'хавсралт илгээж чадсангүй';
        }
      }

      unawaited(advice.load(refresh: true));
      unawaited(report.load(refresh: true));
      if (!mounted) return;
      navigator.pop(true);

      if (attachFailure != null) {
        AppSnack.errorOn(
          messenger,
          'Тасалбар хадгалагдсан ч хавсралт очсонгүй: $attachFailure',
        );
      } else {
        AppSnack.successOn(
          messenger,
          publish
              ? 'Тасалбар нийтлэгдлээ.'
              : 'Ноорогт хадгаллаа. Ноорог зөвхөн танд харагдана — нийтлэх '
                  'хүртэл бусад эмч нарт харагдахгүй.',
        );
      }
    } on ApiException catch (e) {
      _submitFailed(e.message);
    } catch (_) {
      _submitFailed('Хадгалж чадсангүй. Дахин оролдоно уу.');
    }
  }

  void _submitFailed(String message) {
    if (!mounted) return;
    setState(() => _saving = false);
    AppSnack.error(context, message);
  }

  Future<void> _confirmDiscard() async {
    if (_saving) return;
    final discard = await confirmDialog(
      context,
      title: 'Бичсэнээ хаях уу?',
      message: 'Нийтлээгүй тасалбар хадгалагдахгүй.',
      confirmLabel: 'Хаях',
      destructive: true,
    );
    if (discard && mounted) Navigator.of(context).pop();
  }

  // -------------------------------------------------------------------
  // Харагдах байдал
  // -------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return PopScope<Object?>(
      // Урт эмнэлзүйн тэмдэглэл санамсаргүй "буцах"-аар алга болохгүй.
      canPop: !_dirty && !_saving,
      onPopInvokedWithResult: (bool didPop, Object? result) {
        if (!didPop) _confirmDiscard();
      },
      child: Scaffold(
        appBar: AppBar(
          title: const Text('Шинэ тасалбар'),
          bottom: _saving
              ? const PreferredSize(
                  preferredSize: Size.fromHeight(2),
                  child: LinearProgressIndicator(minHeight: 2),
                )
              : null,
        ),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          children: <Widget>[
            _buildPatientCard(theme),
            const SizedBox(height: 12),
            _buildTypeCard(theme),
            const SizedBox(height: 12),
            _buildBodyCard(),
            const SizedBox(height: 12),
            _buildAttachCard(theme),
            const SizedBox(height: 14),
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Icon(
                  Icons.info_outline_rounded,
                  size: 16,
                  color: theme.textTheme.bodySmall?.color,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    'Нийтэлсэн тасалбар бусад эмч нарт шууд харагдана. '
                    'Ноорог зөвхөн танд харагдана.',
                    style: theme.textTheme.bodySmall,
                  ),
                ),
              ],
            ),
          ],
        ),
        bottomNavigationBar: DecoratedBox(
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            border: Border(top: BorderSide(color: theme.dividerColor)),
          ),
          child: SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
              child: Row(
                children: <Widget>[
                  Expanded(
                    child: OutlinedButton(
                      onPressed:
                          _canSubmit ? () => _submit(publish: false) : null,
                      child: const Text('Ноорогт хадгалах'),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: FilledButton.icon(
                      onPressed:
                          _canSubmit ? () => _submit(publish: true) : null,
                      icon: const Icon(Icons.send_rounded, size: 18),
                      label: const Text('Нийтлэх'),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  static const EdgeInsets _cardPadding = EdgeInsets.fromLTRB(14, 12, 14, 14);

  Widget _buildPatientCard(ThemeData theme) {
    final patient = _patient;
    return SectionCard(
      title: 'Иргэн',
      subtitle: 'Тасалбар хэний тухай вэ',
      icon: Icons.person_outline_rounded,
      padding: _cardPadding,
      onTap: _saving ? null : _pickPatient,
      trailing: patient == null
          ? null
          : TextButton(
              onPressed: _saving ? null : _pickPatient,
              child: const Text('Солих'),
            ),
      child: patient == null
          ? Row(
              children: <Widget>[
                Icon(Icons.search_rounded, color: theme.colorScheme.primary),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Регистр эсвэл нэрээр хайж сонгоно уу',
                    style: theme.textTheme.bodyMedium?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            )
          : _PatientSummary(patient: patient),
    );
  }

  Widget _buildTypeCard(ThemeData theme) {
    final Widget child;
    if (_typesLoading) {
      child = const SizedBox(
        height: 36,
        child: Align(
          alignment: Alignment.centerLeft,
          child: SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(strokeWidth: 2.2),
          ),
        ),
      );
    } else if (_typesError != null) {
      child = Row(
        children: <Widget>[
          Expanded(
            child: Text(
              _typesError!,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.error,
              ),
            ),
          ),
          TextButton(onPressed: _loadTypes, child: const Text('Дахин оролдох')),
        ],
      );
    } else if (_types.isEmpty) {
      child = Text(
        'Тасалбарын хэлбэр тохируулагдаагүй байна.',
        style: theme.textTheme.bodySmall,
      );
    } else {
      child = Wrap(
        spacing: 8,
        runSpacing: 8,
        children: <Widget>[
          for (final TicketTypeOption t in _types)
            ChoiceChip(
              label: Text(t.label),
              selected: _type == t.value,
              onSelected:
                  _saving ? null : (_) => setState(() => _type = t.value),
            ),
        ],
      );
    }

    return SectionCard(
      title: 'Хэлбэр',
      icon: Icons.category_outlined,
      padding: _cardPadding,
      child: child,
    );
  }

  Widget _buildBodyCard() {
    return SectionCard(
      title: 'Агуулга',
      icon: Icons.notes_rounded,
      padding: _cardPadding,
      child: TextField(
        controller: _body,
        enabled: !_saving,
        minLines: 5,
        maxLines: 12,
        textCapitalization: TextCapitalization.sentences,
        onChanged: (_) => setState(() {}),
        decoration: const InputDecoration(
          hintText: 'Эмнэлзүйн асуулт, зөвлөгөө хүсэх зүйлээ бичнэ үү…',
        ),
      ),
    );
  }

  Widget _buildAttachCard(ThemeData theme) {
    return SectionCard(
      title: 'Хавсралт',
      subtitle: 'Зураг, PDF, баримт бичиг — 10 МБ хүртэл',
      icon: Icons.attach_file_rounded,
      padding: _cardPadding,
      trailing: _files.isEmpty
          ? null
          : Text('${_files.length}', style: theme.textTheme.titleSmall),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          if (_files.isNotEmpty) ...<Widget>[
            SizedBox(
              height: 84,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: _files.length,
                separatorBuilder: (BuildContext context, int index) =>
                    const SizedBox(width: 8),
                itemBuilder: (BuildContext context, int index) => _Thumb(
                  file: _files[index],
                  onRemove: _saving
                      ? null
                      : () => setState(() => _files.removeAt(index)),
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: <Widget>[
              _AttachButton(
                icon: Icons.photo_camera_outlined,
                label: 'Зураг авах',
                onTap: _saving ? null : () => _addPhoto(ImageSource.camera),
              ),
              _AttachButton(
                icon: Icons.photo_library_outlined,
                label: 'Зургийн сан',
                onTap: _saving ? null : () => _addPhoto(ImageSource.gallery),
              ),
              _AttachButton(
                icon: Icons.insert_drive_file_outlined,
                label: 'Файл',
                onTap: _saving ? null : _addDocuments,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

/// Сонгосон иргэний товч мэдээлэл.
class _PatientSummary extends StatelessWidget {
  const _PatientSummary({required this.patient});

  final PatientBrief patient;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final details = <String>[
      patient.registration,
      if (patient.age != null) '${patient.age} нас',
      if ((patient.provinceCity ?? '').trim().isNotEmpty)
        patient.provinceCity!.trim(),
    ].join(' · ');

    return Row(
      children: <Widget>[
        CircleAvatar(
          radius: 22,
          backgroundColor: AppColors.primaryLight,
          child: Text(
            patient.initials,
            style: theme.textTheme.titleSmall?.copyWith(
              color: theme.colorScheme.primary,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(patient.fullName, style: theme.textTheme.titleSmall),
              const SizedBox(height: 2),
              Text(details, style: theme.textTheme.bodySmall),
            ],
          ),
        ),
      ],
    );
  }
}

class _AttachButton extends StatelessWidget {
  const _AttachButton({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  final IconData icon;
  final String label;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    return OutlinedButton.icon(
      onPressed: onTap,
      icon: Icon(icon, size: 18),
      label: Text(label),
      // Сэдвийн товч бүтэн өргөнтэй — Wrap дотор хязгааргүй өргөн болж
      // унахгүйн тулд энд жижиг хэмжээ өгнө.
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(0, 40),
        padding: const EdgeInsets.symmetric(horizontal: 12),
        textStyle: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
      ),
    );
  }
}

/// Хавсралтын жижиг зураг, устгах товчтой.
class _Thumb extends StatelessWidget {
  const _Thumb({required this.file, required this.onRemove});

  final File file;
  final VoidCallback? onRemove;

  static const Set<String> _imageExt = <String>{
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'heic',
  };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final name = file.uri.pathSegments.last;
    final dot = name.lastIndexOf('.');
    final ext = dot == -1 ? '' : name.substring(dot + 1).toLowerCase();

    final Widget fallback = Container(
      color: AppColors.surfaceAlt,
      alignment: Alignment.center,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(
            Icons.insert_drive_file_outlined,
            color: theme.colorScheme.primary,
          ),
          const SizedBox(height: 4),
          Text(ext.toUpperCase(), style: theme.textTheme.bodySmall),
        ],
      ),
    );

    return SizedBox(
      width: 84,
      height: 84,
      child: Stack(
        children: <Widget>[
          Positioned.fill(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(AppTheme.cardRadius),
              child: _imageExt.contains(ext)
                  ? Image.file(
                      file,
                      fit: BoxFit.cover,
                      errorBuilder: (BuildContext context, Object error,
                              StackTrace? stack) =>
                          fallback,
                    )
                  : fallback,
            ),
          ),
          if (onRemove != null)
            Positioned(
              top: 2,
              right: 2,
              child: Material(
                color: Colors.black54,
                shape: const CircleBorder(),
                child: InkWell(
                  customBorder: const CircleBorder(),
                  onTap: onRemove,
                  child: const Padding(
                    padding: EdgeInsets.all(3),
                    child: Icon(Icons.close_rounded, size: 16, color: Colors.white),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}

/// Иргэн сонгох — `/api/doctor/patients`. Сервер 3-аас доош тэмдэгттэй
/// хайлтыг `SEARCH_TOO_SHORT` гэж татгалздаг тул түүнээс өмнө илгээхгүй.
class _PatientPickerPage extends StatefulWidget {
  const _PatientPickerPage();

  @override
  State<_PatientPickerPage> createState() => _PatientPickerPageState();
}

class _PatientPickerPageState extends State<_PatientPickerPage> {
  final TextEditingController _query = TextEditingController();
  Timer? _debounce;

  List<PatientBrief> _results = const <PatientBrief>[];
  bool _loading = false;
  ApiException? _error;

  /// Удаан ирсэн хуучин хариу шинэ хайлтын үр дүнг дарж бичихээс сэргийлнэ.
  int _seq = 0;

  @override
  void dispose() {
    _debounce?.cancel();
    _query.dispose();
    super.dispose();
  }

  void _onChanged(String _) {
    _debounce?.cancel();
    setState(() {});
    _debounce = Timer(const Duration(milliseconds: 400), _search);
  }

  Future<void> _search() async {
    final text = _query.text.trim();
    if (text.length < 3) {
      setState(() {
        _results = const <PatientBrief>[];
        _loading = false;
        _error = null;
      });
      return;
    }

    final mine = ++_seq;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final page = await context
          .read<DoctorRepository>()
          .searchPatients(search: text, limit: 30, offset: 0);
      if (!mounted || mine != _seq) return;
      setState(() {
        _results = page.items;
        _loading = false;
      });
    } on ApiException catch (e) {
      _failed(mine, e);
    } catch (_) {
      _failed(mine, ApiException('Хайлт амжилтгүй боллоо. Дахин оролдоно уу.'));
    }
  }

  void _failed(int mine, ApiException error) {
    if (!mounted || mine != _seq) return;
    setState(() {
      _error = error;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Иргэн сонгох')),
      body: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _query,
              autofocus: true,
              onChanged: _onChanged,
              textInputAction: TextInputAction.search,
              onSubmitted: (_) {
                _debounce?.cancel();
                _search();
              },
              decoration: InputDecoration(
                hintText: 'Регистрийн дугаар эсвэл нэр',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: _loading
                    ? const Padding(
                        padding: EdgeInsets.all(14),
                        child: SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      )
                    : null,
              ),
            ),
          ),
          Expanded(child: _buildResults()),
        ],
      ),
    );
  }

  Widget _buildResults() {
    if (_query.text.trim().length < 3) {
      return const EmptyView(
        title: 'Иргэн хайх',
        message: 'Регистрийн дугаар эсвэл нэрийн 3-аас доошгүй тэмдэгт '
            'оруулна уу.',
        icon: Icons.person_search_outlined,
      );
    }

    final error = _error;
    if (error != null) return ErrorView(error: error, onRetry: _search);

    if (_results.isEmpty) {
      if (_loading) return const LoadingView(label: 'Хайж байна…');
      return const EmptyView(
        title: 'Иргэн олдсонгүй',
        message: 'Өөр түлхүүр үгээр хайж үзнэ үү.',
        icon: Icons.person_off_outlined,
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
      itemCount: _results.length,
      separatorBuilder: (BuildContext context, int index) =>
          const SizedBox(height: 10),
      itemBuilder: (BuildContext context, int index) {
        final patient = _results[index];
        return SectionCard(
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
          onTap: () => Navigator.of(context).pop(patient),
          child: _PatientSummary(patient: patient),
        );
      },
    );
  }
}
