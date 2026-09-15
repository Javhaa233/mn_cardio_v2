import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_client.dart';
import '../../core/network/api_exception.dart';
import '../../core/network/envelope.dart';
import '../../core/util/json_read.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'doctor_models.dart';
import 'icd_picker_sheet.dart';

/// Техникийн шаардлага §1.6 — даатгалын кодчиллыг ЭМД-ын сангаас татах.
///
/// Онош сонгоод тухайн үйлчлүүлэгчид даатгалаар хөнгөлөгдөх эмийн жагсаалтыг
/// харна. Сервер регистрийн дугаарыг **өөрөө** тогтоодог: эрхийг шалгасны
/// дараа. Тиймээс апп регистр дамжуулахгүй (API.md §9.11).
class DoctorEmdScreen extends StatefulWidget {
  const DoctorEmdScreen({
    super.key,
    required this.patientId,
    this.patientName,
  });

  final int patientId;
  final String? patientName;

  @override
  State<DoctorEmdScreen> createState() => _DoctorEmdScreenState();
}

class _DoctorEmdScreenState extends State<DoctorEmdScreen> {
  IcdCode? _icd;
  List<Map<String, dynamic>> _drugs = const <Map<String, dynamic>>[];
  bool _loading = false;
  bool _partial = false;
  ApiException? _error;

  Future<void> _pickIcd() async {
    final picked = await showModalBottomSheet<IcdCode>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const IcdPickerSheet(),
    );
    if (picked == null || !mounted) return;
    setState(() => _icd = picked);
    await _load();
  }

  Future<void> _load() async {
    final icd = _icd;
    if (icd == null) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final response = await context.read<ApiClient>().getRaw(
        '/api/doctor/emd/drugs',
        query: <String, dynamic>{
          'patientId': widget.patientId,
          'icd10': icd.code,
        },
      );
      if (!mounted) return;
      setState(() {
        _drugs = Envelope.asList(response);
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        // 502 бол ЭМД-ын үйлчилгээ унасан — манай алдаа биш гэдгийг хэлнэ.
        _error = e;
        _loading = false;
        _partial = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('ЭМД-ын эм'),
        bottom: widget.patientName == null
            ? null
            : PreferredSize(
                preferredSize: const Size.fromHeight(20),
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(
                    widget.patientName!,
                    style: theme.textTheme.bodySmall,
                  ),
                ),
              ),
      ),
      body: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: Row(
              children: <Widget>[
                Expanded(
                  child: Text(
                    _icd == null
                        ? 'Оношоо сонгоно уу'
                        : '${_icd!.code} · ${_icd!.label}',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: theme.textTheme.bodyMedium,
                  ),
                ),
                const SizedBox(width: 10),
                FilledButton.icon(
                  onPressed: _pickIcd,
                  icon: const Icon(Icons.medical_information_outlined, size: 18),
                  label: Text(_icd == null ? 'Онош сонгох' : 'Солих'),
                ),
              ],
            ),
          ),
          Expanded(child: _body(theme)),
        ],
      ),
    );
  }

  Widget _body(ThemeData theme) {
    if (_icd == null) {
      return const EmptyView(
        title: 'Онош сонгоогүй байна',
        message: 'Даатгалаар хөнгөлөгдөх эмийн жагсаалтыг оношоор харна.',
        icon: Icons.medication_outlined,
      );
    }
    if (_loading) return const LoadingView(label: 'ЭМД-аас уншиж байна…');
    if (_error != null) {
      return ErrorView(error: _error!, onRetry: _load);
    }
    if (_drugs.isEmpty) {
      return const EmptyView(
        title: 'Эм олдсонгүй',
        message: 'Энэ оношид даатгалаар хөнгөлөгдөх эм бүртгэгдээгүй байна.',
        icon: Icons.medication_outlined,
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
      itemCount: _drugs.length + (_partial ? 1 : 0),
      itemBuilder: (BuildContext context, int index) {
        if (_partial && index == 0) {
          return Padding(
            padding: const EdgeInsets.only(bottom: 12),
            child: Text(
              'Зарим оношийн хариу ирсэнгүй — жагсаалт бүрэн биш байж болно.',
              style: theme.textTheme.bodySmall?.copyWith(
                color: AppColors.warning,
              ),
            ),
          );
        }
        final drug = _drugs[_partial ? index - 1 : index];
        return Padding(
          padding: const EdgeInsets.only(bottom: 10),
          child: SectionCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  J.strOr(drug, <String>['tabletName', 'TabletName']),
                  style: theme.textTheme.titleSmall,
                ),
                const SizedBox(height: 2),
                if (J.str(drug, <String>['internationalName']) != null)
                  Text(
                    J.strOr(drug, <String>['internationalName']),
                    style: theme.textTheme.bodySmall,
                  ),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 12,
                  children: <Widget>[
                    if (J.str(drug, <String>['tabletCode']) != null)
                      Text(
                        'Код: ${J.strOr(drug, <String>['tabletCode'])}',
                        style: theme.textTheme.bodySmall,
                      ),
                    if (J.str(drug, <String>['diagCode']) != null)
                      Text(
                        'Онош: ${J.strOr(drug, <String>['diagCode'])}',
                        style: theme.textTheme.bodySmall,
                      ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
