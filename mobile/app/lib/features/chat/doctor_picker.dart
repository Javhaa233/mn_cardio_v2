import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_exception.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'chat_models.dart';
import 'chat_repository.dart';

/// Эмч сонгогч — вебийн `customComponents/Chat/DoctorPicker.jsx`.
///
/// Вебийнх шиг гурван газар дахин ашиглана: 1:1 яриа эхлүүлэх, бүлэг үүсгэх
/// ([multiple] — олон сонголт), бүлэгт гишүүн нэмэх.
///
/// Гурван шүүлтүүр: аймаг/хот, сум/дүүрэг, дээр нь нэр, мэргэжил,
/// байгууллагаар чөлөөт хайлт. Сум нь аймаг сонгох хүртэл идэвхгүй, аймаг
/// солигдоход "Бүх сум" руу буцна — өмнөх аймгийн сум юутай ч таарахгүй.
///
/// Хуудас бүр 50 (серверийн дээд хязгаар), доош гүйлгэхэд дараагийнх нь
/// нэмэгдэнэ.
///
/// Үйлчлүүлэгчид сервер хайлтыг **эмчилж буй багаар нь хязгаарладаг** бөгөөд
/// шүүлтүүрийн жагсаалтыг хоосон буцаадаг — тэр үед шүүлтүүрийн мөр нуугдана.
///
/// Өндөр нь хязгаарлагдсан газар байрлуулна (жишээ нь `Expanded` дотор):
/// доторх жагсаалт өөрөө гүйлгэгддэг.
class DoctorPicker extends StatefulWidget {
  const DoctorPicker({
    super.key,
    required this.onPick,
    this.multiple = false,
    this.selected = const <String>{},
  });

  /// Мөр дээр дарахад. Олон сонголтын горимд сонголтыг сэлгэнэ.
  final ValueChanged<DirectoryPerson> onPick;

  final bool multiple;

  /// Сонгогдсон хүмүүсийн [DirectoryPerson.key] — [multiple] үед тэмдэглэнэ.
  final Set<String> selected;

  @override
  State<DoctorPicker> createState() => _DoctorPickerState();
}

class _DoctorPickerState extends State<DoctorPicker> {
  static const int _pageSize = 50;

  static const InputDecoration _dense = InputDecoration(
    isDense: true,
    contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
  );

  final TextEditingController _search = TextEditingController();
  final ScrollController _scroll = ScrollController();
  Timer? _debounce;

  DirectoryFilters _filters = DirectoryFilters.empty;
  String? _province;
  String? _soum;

  List<DirectoryPerson> _people = const <DirectoryPerson>[];
  int _total = 0;
  int _page = 0;
  bool _loading = true;
  bool _loadingMore = false;
  ApiException? _error;

  /// Удаан ирсэн хуучин хариу шинэ хайлтын үр дүнг дарж бичихээс сэргийлнэ.
  int _seq = 0;

  @override
  void initState() {
    super.initState();
    _scroll.addListener(_onScroll);
    // initState дотор setState дуудах боломжгүй — эхний фреймийн дараа.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _loadFilters();
      _reload();
    });
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _search.dispose();
    _scroll
      ..removeListener(_onScroll)
      ..dispose();
    super.dispose();
  }

  Future<void> _loadFilters() async {
    try {
      final filters = await context.read<ChatRepository>().directoryFilters();
      debugPrint(
        '[chat] directory filters: ${filters.provinces.length} provinces, '
        '${filters.soums.length} soums',
      );
      if (!mounted) return;
      setState(() => _filters = filters);
    } catch (e) {
      // Шүүлтүүргүйгээр хайлт ажиллана, гэхдээ алдааг чимээгүй залгихгүй: мөр
      // яагаад харагдахгүй байгааг олох цорын ганц сэжүүр нь энэ.
      debugPrint(
        '[chat] directory filters failed: '
        '${e is ApiException ? '${e.statusCode} ${e.message}' : e}',
      );
    }
  }

  Future<void> _reload() => _fetch(0, append: false);

  Future<void> _fetch(int page, {required bool append}) async {
    final mine = ++_seq;
    setState(() {
      if (append) {
        _loadingMore = true;
      } else {
        _loading = true;
        _error = null;
      }
    });

    try {
      final result = await context.read<ChatRepository>().searchDoctors(
            search: _search.text,
            provinceName: _province,
            soumName: _soum,
            pageNumber: page,
            pageSize: _pageSize,
          );
      if (!mounted || mine != _seq) return;
      setState(() {
        _page = page;
        _total = result.total;
        _people = append
            ? <DirectoryPerson>[..._people, ...result.people]
            : result.people;
        _loading = false;
        _loadingMore = false;
      });
      if (!append && _scroll.hasClients) _scroll.jumpTo(0);
    } on ApiException catch (e) {
      _fail(mine, append, e);
    } catch (_) {
      // ApiException биш алдаа ч жагсаалтыг "Хайж байна…" дээр гацаахгүй.
      _fail(mine, append, ApiException('Алдаа гарлаа. Дахин оролдоно уу.'));
    }
  }

  void _fail(int mine, bool append, ApiException error) {
    if (!mounted || mine != _seq) return;
    setState(() {
      _loading = false;
      _loadingMore = false;
      // Дараагийн хуудас амжилтгүй болсон нь харагдаж буй жагсаалтыг арчих
      // шалтгаан биш.
      if (!append) {
        _error = error;
        _people = const <DirectoryPerson>[];
        _total = 0;
      }
    });
  }

  void _onScroll() {
    if (!_scroll.hasClients || _loading || _loadingMore) return;
    if (_people.length >= _total) return;
    if (_scroll.position.extentAfter < 400) {
      _fetch(_page + 1, append: true);
    }
  }

  void _onSearchChanged(String _) {
    _debounce?.cancel();
    // Сервер талд хайлтын давтамжийн хязгаарлалт бий тул товч дарах бүрд
    // хүсэлт явуулахгүй.
    _debounce = Timer(const Duration(milliseconds: 450), _reload);
    setState(() {}); // цэвэрлэх товчийг харуулах/нуух
  }

  void _setProvince(String? value) {
    if (value == _province) return;
    setState(() {
      _province = value;
      _soum = null;
    });
    _reload();
  }

  void _setSoum(String? value) {
    if (value == _soum) return;
    setState(() => _soum = value);
    _reload();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Column(
      children: <Widget>[
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 4),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              if (!_filters.isEmpty) ...<Widget>[
                _buildFilterRow(),
                const SizedBox(height: 10),
              ],
              TextField(
                controller: _search,
                onChanged: _onSearchChanged,
                textInputAction: TextInputAction.search,
                onSubmitted: (_) {
                  _debounce?.cancel();
                  _reload();
                },
                decoration: InputDecoration(
                  // Сервер нэр, мэргэжил, албан тушаал, байгууллагаар хайдаг.
                  hintText: 'Эмчийн нэр, мэргэжил, байгууллагаар хайх',
                  prefixIcon: const Icon(Icons.search_rounded),
                  suffixIcon: _buildSearchSuffix(),
                ),
              ),
              if (_error == null) ...<Widget>[
                const SizedBox(height: 6),
                Text(_countLabel, style: theme.textTheme.bodySmall),
              ],
            ],
          ),
        ),
        Expanded(child: _buildBody()),
      ],
    );
  }

  Widget? _buildSearchSuffix() {
    if (_loading && _people.isNotEmpty) {
      return const Padding(
        padding: EdgeInsets.all(14),
        child: SizedBox(
          width: 16,
          height: 16,
          child: CircularProgressIndicator(strokeWidth: 2),
        ),
      );
    }
    if (_search.text.isEmpty) return null;
    return IconButton(
      tooltip: 'Цэвэрлэх',
      icon: const Icon(Icons.close_rounded),
      onPressed: () {
        _debounce?.cancel();
        _search.clear();
        _reload();
      },
    );
  }

  /// Вебийнх шиг: "Нийт: 3290 · үзүүлсэн 50".
  String get _countLabel {
    if (_loading && _people.isEmpty) return 'Хайж байна…';
    final shown =
        _total > _people.length ? ' · үзүүлсэн ${_people.length}' : '';
    return 'Нийт: $_total$shown';
  }

  Widget _buildFilterRow() {
    final province = _province;
    final soums = province == null
        ? const <DirectoryPlace>[]
        : _filters.soumsOf(province);

    return Row(
      children: <Widget>[
        Expanded(
          child: DropdownButtonFormField<String?>(
            initialValue: _province,
            isExpanded: true,
            decoration: _dense,
            items: <DropdownMenuItem<String?>>[
              const DropdownMenuItem<String?>(
                value: null,
                child: Text('Бүх аймаг / хот'),
              ),
              for (final DirectoryPlace p in _filters.provinces)
                DropdownMenuItem<String?>(
                  value: p.name,
                  child: Text(p.label, overflow: TextOverflow.ellipsis),
                ),
            ],
            onChanged: _setProvince,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: DropdownButtonFormField<String?>(
            // `initialValue` зөвхөн анх үүсэхэд уншигддаг. Аймаг солигдоход
            // сум "Бүх сум" руу буцах ёстой тул түлхүүрээр шинээр үүсгэнэ.
            key: ValueKey<String>('soum-${province ?? ''}'),
            initialValue: _soum,
            isExpanded: true,
            decoration: _dense,
            disabledHint: const Text(
              'Бүх сум / дүүрэг',
              overflow: TextOverflow.ellipsis,
            ),
            items: <DropdownMenuItem<String?>>[
              const DropdownMenuItem<String?>(
                value: null,
                child: Text('Бүх сум / дүүрэг', overflow: TextOverflow.ellipsis),
              ),
              for (final DirectoryPlace s in soums)
                DropdownMenuItem<String?>(
                  value: s.name,
                  child: Text(s.label, overflow: TextOverflow.ellipsis),
                ),
            ],
            // Аймаг сонгоогүй, эсвэл тэр аймагт сумын мэдээлэлтэй эмч
            // байхгүй бол идэвхгүй — вебийнхтэй ижил.
            onChanged: soums.isEmpty ? null : _setSoum,
          ),
        ),
      ],
    );
  }

  Widget _buildBody() {
    if (_loading && _people.isEmpty) {
      return const LoadingView(label: 'Хайж байна…');
    }

    final error = _error;
    if (error != null) {
      return ErrorView(error: error, onRetry: _reload);
    }

    if (_people.isEmpty) {
      final filtered = _search.text.trim().isNotEmpty || _province != null;
      return EmptyView(
        title: filtered ? 'Илэрц олдсонгүй' : 'Эмч олдсонгүй',
        message: filtered
            ? 'Шүүлтүүрээ өөрчилж эсвэл өөр түлхүүр үгээр хайж үзнэ үү.'
            : 'Танд одоогоор эмчилгээний баг хуваарилагдаагүй байж болно. '
                'Эмнэлэгт хандаж лавлана уу.',
        icon: Icons.person_search_outlined,
      );
    }

    return ListView.separated(
      controller: _scroll,
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      itemCount: _people.length + 1,
      separatorBuilder: (BuildContext context, int index) =>
          const SizedBox(height: 10),
      itemBuilder: (BuildContext context, int index) {
        if (index == _people.length) return _buildFooter();
        final person = _people[index];
        return _PersonCard(
          person: person,
          multiple: widget.multiple,
          selected: widget.selected.contains(person.key),
          onTap: () => widget.onPick(person),
        );
      },
    );
  }

  Widget _buildFooter() {
    if (_loadingMore) {
      return const Padding(
        padding: EdgeInsets.symmetric(vertical: 12),
        child: Center(
          child: SizedBox(
            width: 20,
            height: 20,
            child: CircularProgressIndicator(strokeWidth: 2.2),
          ),
        ),
      );
    }
    if (_people.length >= _total) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Center(
          child: Text(
            'Бүгдийг үзүүллээ',
            style: Theme.of(context).textTheme.bodySmall,
          ),
        ),
      );
    }
    return const SizedBox(height: 24);
  }
}

class _PersonCard extends StatelessWidget {
  const _PersonCard({
    required this.person,
    required this.multiple,
    required this.selected,
    required this.onTap,
  });

  final DirectoryPerson person;
  final bool multiple;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SectionCard(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      onTap: onTap,
      child: Row(
        children: <Widget>[
          if (multiple) ...<Widget>[
            Checkbox(value: selected, onChanged: (_) => onTap()),
            const SizedBox(width: 4),
          ] else ...<Widget>[
            CircleAvatar(
              radius: 22,
              backgroundColor:
                  theme.colorScheme.primary.withValues(alpha: 0.12),
              child: Icon(
                Icons.medical_services_outlined,
                size: 20,
                color: theme.colorScheme.primary,
              ),
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(person.name, style: theme.textTheme.titleSmall),
                if (person.subtitle.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 3),
                  Text(
                    person.subtitle,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ],
            ),
          ),
          if (!multiple) const Icon(Icons.chevron_right_rounded, size: 20),
        ],
      ),
    );
  }
}
