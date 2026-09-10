import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../shared/widgets/paged_list_view.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'doctor_controllers.dart';
import 'doctor_models.dart';
import 'doctor_patient_card_screen.dart';
import 'doctor_repository.dart';

/// 1.5 Үйлчлүүлэгч хайх.
///
/// [pickMode] `true` үед сонгосон үйлчлүүлэгчийг буцаана (хяналтад нэмэхэд),
/// `false` үед картыг нь нээнэ.
class DoctorPatientsScreen extends StatefulWidget {
  const DoctorPatientsScreen({super.key, this.pickMode = false});

  final bool pickMode;

  @override
  State<DoctorPatientsScreen> createState() => _DoctorPatientsScreenState();
}

class _DoctorPatientsScreenState extends State<DoctorPatientsScreen> {
  late final PatientSearchController _controller;
  final TextEditingController _search = TextEditingController();

  @override
  void initState() {
    super.initState();
    // Хайлт нь дэлгэц тус бүрд шинэ — өмнөх хайлтын үр дүн үлдэхгүй.
    _controller = PatientSearchController(context.read<DoctorRepository>());
    // Цэвэрлэх товч шууд гарч ирэхийн тулд текстийн өөрчлөлтийг сонсоно:
    // хайлтын үр дүн 450 мс хойшилдог тул зөвхөн түүнийг хүлээвэл товч
    // хожуу гарна.
    _search.addListener(_onTextChanged);
  }

  void _onTextChanged() => setState(() {});

  @override
  void dispose() {
    _search.removeListener(_onTextChanged);
    _controller.dispose();
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<PatientSearchController>.value(
      value: _controller,
      child: Scaffold(
        appBar: AppBar(
          title: Text(
            widget.pickMode ? 'Үйлчлүүлэгч сонгох' : 'Үйлчлүүлэгч хайх',
          ),
        ),
        body: Column(
          children: <Widget>[
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
              child: TextField(
                controller: _search,
                autofocus: true,
                onChanged: _controller.setSearch,
                textInputAction: TextInputAction.search,
                decoration: InputDecoration(
                  hintText: 'Регистрийн дугаар эсвэл нэр',
                  prefixIcon: const Icon(Icons.search_rounded),
                  suffixIcon: _search.text.isEmpty
                      ? null
                      : IconButton(
                          icon: const Icon(Icons.close_rounded),
                          onPressed: () {
                            _search.clear();
                            _controller.setSearch('');
                          },
                        ),
                ),
              ),
            ),
            Expanded(
              child: Consumer<PatientSearchController>(
                builder: (
                  BuildContext context,
                  PatientSearchController controller,
                  _,
                ) {
                  // Сервер 3-аас доошгүй тэмдэгт шаарддаг тул түүнээс өмнө
                  // хүсэлт огт явуулахгүй, шалтгааныг нь хэлнэ.
                  if (controller.isSearchTooShort) {
                    return EmptyView(
                      title: controller.search.trim().isEmpty
                          ? 'Хайлт хийнэ үү'
                          : 'Хайлтын утга хэт богино',
                      message: 'Регистрийн дугаар эсвэл нэрээс 3-аас доошгүй '
                          'тэмдэгт оруулна уу.',
                      icon: Icons.person_search_outlined,
                    );
                  }

                  return PagedListView<PatientBrief>(
                    controller: controller,
                    loadingLabel: 'Хайж байна…',
                    itemBuilder: (
                      BuildContext context,
                      PatientBrief patient,
                      _,
                    ) =>
                        _PatientTile(
                      patient: patient,
                      onTap: () => _onSelect(patient),
                    ),
                    empty: const EmptyView(
                      title: 'Үйлчлүүлэгч олдсонгүй',
                      message: 'Регистрийн дугаар, эцэг/эхийн нэр, өөрийн '
                          'нэрээр дахин хайж үзнэ үү.',
                      icon: Icons.person_search_outlined,
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _onSelect(PatientBrief patient) {
    if (widget.pickMode) {
      Navigator.of(context).pop(patient);
      return;
    }
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => DoctorPatientCardScreen(
          patientId: patient.idData,
          initialName: patient.fullName,
        ),
      ),
    );
  }
}

class _PatientTile extends StatelessWidget {
  const _PatientTile({required this.patient, required this.onTap});

  final PatientBrief patient;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return SectionCard(
      onTap: onTap,
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
                Text(
                  patient.fullName,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.titleSmall,
                ),
                const SizedBox(height: 2),
                Text(
                  patient.subtitle,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: theme.textTheme.bodySmall,
                ),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, size: 20),
        ],
      ),
    );
  }
}
