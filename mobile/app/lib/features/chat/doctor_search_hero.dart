import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../shared/theme/app_colors.dart';
import '../../shared/theme/app_theme.dart';
import 'chat_models.dart';
import 'chat_repository.dart';
import 'doctor_search_screen.dart';

/// Эмч хайх хэсэг — чатын дээд талд.
///
/// Урьд нь эмчийн нүүр хуудсан дээр байсан. Хайлтын үр дүн нь **яриа
/// эхлүүлэх** үйлдэл тул чатын хажууд байх нь зөв: нүүр хуудас бол
/// асуумжийн урсгал, энэ нь харилцааны эхлэл.
///
/// Брэндийн градиент дээр. Цагаан бичиг градиентын индиго (дээд зүүн) талд
/// байрлана — тэнд контраст ~7:1.
class DoctorSearchHero extends StatefulWidget {
  const DoctorSearchHero({super.key});

  @override
  State<DoctorSearchHero> createState() => _DoctorSearchHeroState();
}

class _DoctorSearchHeroState extends State<DoctorSearchHero> {
  final TextEditingController _query = TextEditingController();
  DirectoryFilters _filters = DirectoryFilters.empty;
  String? _province;
  String? _soum;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) _loadFilters();
    });
  }

  @override
  void dispose() {
    _query.dispose();
    super.dispose();
  }

  Future<void> _loadFilters() async {
    try {
      final filters = await context.read<ChatRepository>().directoryFilters();
      if (!mounted) return;
      setState(() => _filters = filters);
    } catch (e) {
      // Шүүлтүүргүйгээр хайлт ажиллана; мөр л харагдахгүй.
      debugPrint('[chat] directory filters failed: $e');
    }
  }

  void _search() {
    FocusScope.of(context).unfocus();
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => DoctorSearchScreen(
          initialProvince: _province,
          initialSoum: _soum,
          initialSearch: _query.text.trim(),
        ),
      ),
    );
  }

  InputDecoration _field({String? hint, Widget? prefix, Widget? suffix}) {
    final radius = BorderRadius.circular(AppTheme.controlRadius);
    return InputDecoration(
      hintText: hint,
      prefixIcon: prefix,
      suffixIcon: suffix,
      isDense: true,
      filled: true,
      fillColor: Colors.white,
      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
      border: OutlineInputBorder(borderRadius: radius, borderSide: BorderSide.none),
      enabledBorder:
          OutlineInputBorder(borderRadius: radius, borderSide: BorderSide.none),
      disabledBorder:
          OutlineInputBorder(borderRadius: radius, borderSide: BorderSide.none),
      // Текст бус заагч тул cyan зөвшөөрөгдөнө.
      focusedBorder: OutlineInputBorder(
        borderRadius: radius,
        borderSide: const BorderSide(color: AppColors.cyan, width: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final province = _province;
    final soums = province == null
        ? const <DirectoryPlace>[]
        : _filters.soumsOf(province);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: AppColors.brandGradient,
        borderRadius: BorderRadius.circular(AppTheme.heroRadius),
        // tokens.js § elevation.3 — navy өнгөтэй, саарал хар биш.
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: AppTheme.shadowInk,
            blurRadius: 20,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Container(
                width: 40,
                height: 40,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.18),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.person_search_rounded,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'Эмч хайх',
                      style: theme.textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Улсын хэмжээнд эмчийг олж, шууд чатлана',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: Colors.white.withValues(alpha: 0.92),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          if (!_filters.isEmpty) ...<Widget>[
            Row(
              children: <Widget>[
                Expanded(
                  child: DropdownButtonFormField<String?>(
                    initialValue: _province,
                    isExpanded: true,
                    borderRadius: BorderRadius.circular(12),
                    decoration: _field(),
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
                    onChanged: (String? value) => setState(() {
                      _province = value;
                      // Өмнөх аймгийн сум шинэд таарахгүй.
                      _soum = null;
                    }),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: DropdownButtonFormField<String?>(
                    key: ValueKey<String>('hero-soum-${province ?? ''}'),
                    initialValue: _soum,
                    isExpanded: true,
                    borderRadius: BorderRadius.circular(12),
                    decoration: _field(),
                    disabledHint: const Text(
                      'Бүх сум / дүүрэг',
                      overflow: TextOverflow.ellipsis,
                    ),
                    items: <DropdownMenuItem<String?>>[
                      const DropdownMenuItem<String?>(
                        value: null,
                        child: Text(
                          'Бүх сум / дүүрэг',
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      for (final DirectoryPlace s in soums)
                        DropdownMenuItem<String?>(
                          value: s.name,
                          child: Text(s.label, overflow: TextOverflow.ellipsis),
                        ),
                    ],
                    onChanged: soums.isEmpty
                        ? null
                        : (String? value) => setState(() => _soum = value),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 10),
          ],
          TextField(
            controller: _query,
            textInputAction: TextInputAction.search,
            onSubmitted: (_) => _search(),
            decoration: _field(
              hint: 'Эмчийн нэр, мэргэжил, байгууллагаар хайх',
              prefix: const Icon(Icons.search_rounded),
              suffix: Padding(
                padding: const EdgeInsets.all(4),
                child: IconButton.filled(
                  onPressed: _search,
                  tooltip: 'Хайх',
                  icon: const Icon(Icons.arrow_forward_rounded, size: 20),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
