import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/theme/app_colors.dart';
import '../../shared/widgets/date_range_field.dart';
import '../../shared/widgets/paged_list_view.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'doctor_controllers.dart';
import 'icd_picker_sheet.dart';
import 'doctor_models.dart';
import 'doctor_patient_card_screen.dart';
import 'doctor_repository.dart';
import 'doctor_visit_detail_screen.dart';

/// 1.1 Миний үзлэгүүд.
class DoctorVisitsScreen extends StatefulWidget {
  const DoctorVisitsScreen({super.key});

  @override
  State<DoctorVisitsScreen> createState() => _DoctorVisitsScreenState();
}

class _DoctorVisitsScreenState extends State<DoctorVisitsScreen> {
  final TextEditingController _search = TextEditingController();

  Future<void> _pickIcd(DoctorVisitsController controller) async {
    final picked = await showModalBottomSheet<IcdCode>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const IcdPickerSheet(),
    );
    if (picked != null) await controller.setIcd(picked);
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<DoctorVisitsController>();
      if (controller.state.isIdle) controller.load();
    });
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<DoctorVisitsController>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Миний үзлэгүүд'),
        actions: <Widget>[
          if (controller.total > 0)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: Center(
                child: Text(
                  '${controller.total}',
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
            ),
        ],
      ),
      body: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _search,
              onChanged: controller.setSearch,
              textInputAction: TextInputAction.search,
              decoration: InputDecoration(
                hintText: 'Регистр, нэр, оноош хайх',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: _search.text.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.close_rounded),
                        onPressed: () {
                          _search.clear();
                          controller.setSearch('');
                        },
                      ),
              ),
            ),
          ),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: <Widget>[
                for (final scope in VisitScope.values) ...<Widget>[
                  ChoiceChip(
                    label: Text(scope.label),
                    selected: controller.scope == scope,
                    onSelected: (_) => controller.setScope(scope),
                  ),
                  const SizedBox(width: 8),
                ],
                // Техникийн шаардлага §1.3 — оношоор хайх.
                if (controller.icd == null)
                  ActionChip(
                    avatar: const Icon(
                      Icons.medical_information_outlined,
                      size: 18,
                    ),
                    label: const Text('Онош сонгох'),
                    onPressed: () => _pickIcd(controller),
                  )
                else
                  InputChip(
                    avatar: const Icon(
                      Icons.medical_information_outlined,
                      size: 18,
                    ),
                    label: Text(controller.icd!.code),
                    onPressed: () => _pickIcd(controller),
                    onDeleted: () => controller.setIcd(null),
                  ),
              ],
            ),
          ),
          if (controller.icd != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  controller.icd!.label,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: Theme.of(context).textTheme.bodySmall,
                ),
              ),
            ),
          const SizedBox(height: 8),
          DateRangeFilterBar(
            value: controller.range,
            onChanged: controller.setRange,
            presets: const <int>[7, 30, 90],
          ),
          const SizedBox(height: 8),
          Expanded(
            child: PagedListView<DoctorVisit>(
              controller: controller,
              loadingLabel: 'Үзлэгүүд уншиж байна…',
              itemBuilder: (BuildContext context, DoctorVisit visit, _) =>
                  DoctorVisitTile(visit: visit),
              empty: EmptyView(
                title: controller.search.trim().isNotEmpty
                    ? 'Хайлтад тохирох үзлэг олдсонгүй'
                    : 'Үзлэг байхгүй байна',
                message: controller.scope == VisitScope.mine
                    ? 'Таны бүртгэсэн үзлэг энэ хугацаанд алга. '
                        'Байгууллагын үзлэгийг харахыг оролдоно уу.'
                    : 'Сонгосон хугацаанд үзлэг бүртгэгдээгүй байна.',
                icon: Icons.assignment_outlined,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Үзлэгийн жагсаалтын мөр. Үйлчлүүлэгчийн карт болон дэлгэрэнгүй рүү очно.
class DoctorVisitTile extends StatelessWidget {
  const DoctorVisitTile({super.key, required this.visit, this.showPatient = true});

  final DoctorVisit visit;
  final bool showPatient;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final complaint = (visit.chiefComplaint ?? '').trim();

    return SectionCard(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
      onTap: () => Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => DoctorVisitDetailScreen(visitId: visit.idData),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Icon(
                Icons.event_outlined,
                size: 16,
                color: theme.colorScheme.primary,
              ),
              const SizedBox(width: 7),
              Text(
                MnFormat.date(visit.visitDate),
                style: theme.textTheme.titleSmall,
              ),
              const Spacer(),
              if (visit.hasComplication)
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.danger.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    'Хүндрэлтэй',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w600,
                      color: AppColors.danger,
                    ),
                  ),
                ),
            ],
          ),
          if (showPatient) ...<Widget>[
            const SizedBox(height: 9),
            InkWell(
              onTap: visit.patientId == null
                  ? null
                  : () => Navigator.of(context).push(
                        MaterialPageRoute<void>(
                          builder: (_) => DoctorPatientCardScreen(
                            patientId: visit.patientId!,
                            initialName: visit.patientName,
                          ),
                        ),
                      ),
              borderRadius: BorderRadius.circular(12),
              child: Row(
                children: <Widget>[
                  Icon(
                    Icons.person_outline_rounded,
                    size: 15,
                    color: theme.colorScheme.onSurfaceVariant,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      visit.patientName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  if ((visit.patRegNo ?? '').trim().isNotEmpty)
                    Text(
                      visit.patRegNo!.trim(),
                      style: theme.textTheme.bodySmall?.copyWith(fontSize: 12),
                    ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 9),
          Text(
            visit.diagnosisLabel,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.bodyMedium,
          ),
          if ((visit.icd10 ?? '').trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 6),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: theme.colorScheme.surfaceContainerHighest
                    .withValues(alpha: 0.7),
                borderRadius: BorderRadius.circular(999),
              ),
              child: Text(
                'ICD-10: ${visit.icd10!.trim()}',
                style: theme.textTheme.bodySmall?.copyWith(fontSize: 11.5),
              ),
            ),
          ],
          if (complaint.isNotEmpty) ...<Widget>[
            const SizedBox(height: 8),
            Text(
              complaint,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: theme.textTheme.bodySmall,
            ),
          ],
        ],
      ),
    );
  }
}
