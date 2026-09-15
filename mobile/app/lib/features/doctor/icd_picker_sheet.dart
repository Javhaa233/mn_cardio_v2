import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_exception.dart';
import '../../shared/widgets/state_views.dart';
import 'doctor_models.dart';
import 'doctor_repository.dart';

/// ICD-10 онош сонгох цонх — Техникийн шаардлага §1.3 "оношоор хайх".
///
/// Сонгосон оношийг буцаана. Хоосон буцвал хэрэглэгч болисон гэсэн үг.
class IcdPickerSheet extends StatefulWidget {
  const IcdPickerSheet({super.key});

  @override
  State<IcdPickerSheet> createState() => _IcdPickerSheetState();
}

class _IcdPickerSheetState extends State<IcdPickerSheet> {
  final TextEditingController _query = TextEditingController();
  Timer? _debounce;

  List<IcdCode> _results = const <IcdCode>[];
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _debounce?.cancel();
    _query.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    _debounce?.cancel();
    // Сервер 2 тэмдэгтээс богино хайлтыг хүлээж авдаггүй.
    if (value.trim().length < 2) {
      setState(() {
        _results = const <IcdCode>[];
        _loading = false;
        _error = null;
      });
      return;
    }
    _debounce = Timer(const Duration(milliseconds: 350), () => _search(value));
  }

  Future<void> _search(String value) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final found = await context.read<DoctorRepository>().searchIcd10(value);
      if (!mounted) return;
      setState(() {
        _results = found;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final inset = MediaQuery.of(context).viewInsets.bottom;

    return Padding(
      padding: EdgeInsets.only(bottom: inset),
      child: DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.7,
        maxChildSize: 0.95,
        builder: (BuildContext context, ScrollController scroll) => Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Text('Онош сонгох', style: theme.textTheme.titleMedium),
              const SizedBox(height: 10),
              TextField(
                controller: _query,
                autofocus: true,
                textInputAction: TextInputAction.search,
                onChanged: _onChanged,
                decoration: const InputDecoration(
                  hintText: 'Код эсвэл оношийн нэр (I21, шигдээс…)',
                  prefixIcon: Icon(Icons.search_rounded),
                ),
              ),
              const SizedBox(height: 12),
              Expanded(child: _body(scroll, theme)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _body(ScrollController scroll, ThemeData theme) {
    if (_loading) return const LoadingView(label: 'Хайж байна…');
    if (_error != null) {
      return Center(
        child: Text(_error!, style: theme.textTheme.bodyMedium),
      );
    }
    if (_query.text.trim().length < 2) {
      return Center(
        child: Text(
          'Хайхын тулд 2-оос доошгүй тэмдэгт бичнэ үү.',
          style: theme.textTheme.bodySmall,
        ),
      );
    }
    if (_results.isEmpty) {
      return const EmptyView(
        title: 'Онош олдсонгүй',
        message: 'Өөр код эсвэл нэрээр хайж үзнэ үү.',
        icon: Icons.medical_information_outlined,
      );
    }

    return ListView.separated(
      controller: scroll,
      itemCount: _results.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (BuildContext context, int index) {
        final item = _results[index];
        return ListTile(
          contentPadding: EdgeInsets.zero,
          title: Text(item.code, style: theme.textTheme.titleSmall),
          subtitle: Text(item.label, maxLines: 2, overflow: TextOverflow.ellipsis),
          onTap: () => Navigator.of(context).pop(item),
        );
      },
    );
  }
}
