import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_exception.dart';
import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'doctor_models.dart';
import 'doctor_patient_card_screen.dart';
import 'doctor_repository.dart';

/// Нэг үзлэгийн дэлгэрэнгүй.
///
/// Сервер бүтэн мөрийг буцаадаг ч энд зөвхөн **монгол шошготой буулгасан**
/// талбаруудыг харуулна. Буулгаагүй баганыг харуулбал өгөгдлийн сангийн англи
/// нэр хэрэглэгчид харагдана (Техникийн шаардлага §1.3.11).
class DoctorVisitDetailScreen extends StatefulWidget {
  const DoctorVisitDetailScreen({super.key, required this.visitId});

  final int visitId;

  @override
  State<DoctorVisitDetailScreen> createState() =>
      _DoctorVisitDetailScreenState();
}

class _DoctorVisitDetailScreenState extends State<DoctorVisitDetailScreen> {
  DoctorVisit? _visit;
  ApiException? _error;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final raw =
          await context.read<DoctorRepository>().fetchVisitRaw(widget.visitId);
      if (!mounted) return;
      setState(() {
        _visit = DoctorVisit.fromJson(raw);
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Үзлэгийн дэлгэрэнгүй')),
      body: Builder(
        builder: (BuildContext context) {
          if (_loading) return const LoadingView(label: 'Уншиж байна…');

          final error = _error;
          if (error != null) {
            return ErrorView(
              error: error,
              onRetry: _load,
              // 404 нь "өөр байгууллагын бичлэг" гэсэн утгатай ч байж болно —
              // сервер зориудаар ялгаж хэлдэггүй.
            );
          }

          final visit = _visit;
          if (visit == null) {
            return const EmptyView(
              title: 'Үзлэг олдсонгүй',
              message: 'Энэ үзлэг устсан эсвэл танд харах эрх байхгүй байна.',
              icon: Icons.assignment_outlined,
            );
          }

          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
            children: <Widget>[
              _HeaderCard(visit: visit),
              const SizedBox(height: 12),
              if (visit.patient != null) ...<Widget>[
                _PatientCardLink(visit: visit),
                const SizedBox(height: 12),
              ],
              SectionCard(
                title: 'Онош',
                icon: Icons.medical_information_outlined,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      visit.diagnosisLabel,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            fontWeight: FontWeight.w600,
                            height: 1.5,
                          ),
                    ),
                    if ((visit.mainDiagnosis ?? '').trim().isNotEmpty &&
                        (visit.mainDiagnosisMn ?? '').trim().isNotEmpty) ...<Widget>[
                      const SizedBox(height: 8),
                      Text(
                        visit.mainDiagnosis!.trim(),
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                    const Divider(height: 22),
                    InfoRow(label: 'ICD-10', value: visit.icd10 ?? ''),
                    InfoRow(
                      label: 'Үзлэгийн төрөл',
                      value: visit.examTypeIcd ?? '',
                    ),
                    InfoRow(
                      label: 'Шалтгааны код',
                      value: visit.causeIcd10 ?? '',
                    ),
                    InfoRow(
                      label: 'Мэс ажилбар (ICD-9)',
                      value: visit.procedureIcd9 ?? '',
                    ),
                  ],
                ),
              ),
              if ((visit.chiefComplaint ?? '').trim().isNotEmpty) ...<Widget>[
                const SizedBox(height: 12),
                SectionCard(
                  title: 'Гомдол',
                  icon: Icons.record_voice_over_outlined,
                  child: Text(
                    visit.chiefComplaint!.trim(),
                    style: Theme.of(context)
                        .textTheme
                        .bodyMedium
                        ?.copyWith(height: 1.55),
                  ),
                ),
              ],
              const SizedBox(height: 12),
              const PendingModuleNotice(
                title: 'Үзлэг засварлах',
                message: 'Үзлэгийн бичлэгийг гар утаснаас засах боломж энэ '
                    'хувилбарт байхгүй. Эмнэлзүйн бичилтийг МнКардио '
                    'системийн вэб хувилбараар үргэлжлүүлнэ үү.',
                icon: Icons.edit_off_outlined,
              ),
            ],
          );
        },
      ),
    );
  }
}

class _HeaderCard extends StatelessWidget {
  const _HeaderCard({required this.visit});

  final DoctorVisit visit;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SectionCard(
      child: Row(
        children: <Widget>[
          Container(
            width: 46,
            height: 46,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: theme.colorScheme.primary.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              Icons.event_available_outlined,
              color: theme.colorScheme.primary,
              size: 22,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  MnFormat.date(visit.visitDate),
                  style: theme.textTheme.titleMedium,
                ),
                const SizedBox(height: 2),
                Text(
                  'Үзлэгийн дугаар: ${visit.idData}',
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          if (visit.hasComplication)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
              decoration: BoxDecoration(
                color: AppColors.danger.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(999),
              ),
              child: const Text(
                'Хүндрэлтэй',
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: AppColors.danger,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _PatientCardLink extends StatelessWidget {
  const _PatientCardLink({required this.visit});

  final DoctorVisit visit;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final patient = visit.patient!;

    return SectionCard(
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => DoctorPatientCardScreen(
            patientId: patient.idData,
            initialName: patient.fullName,
          ),
        ),
      ),
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      child: Row(
        children: <Widget>[
          CircleAvatar(
            radius: 21,
            backgroundColor: theme.colorScheme.primary.withValues(alpha: 0.12),
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
                Text(patient.subtitle, style: theme.textTheme.bodySmall),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, size: 20),
        ],
      ),
    );
  }
}
