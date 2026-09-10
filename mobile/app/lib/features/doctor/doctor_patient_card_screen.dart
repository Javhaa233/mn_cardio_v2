import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/measurement_chart.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'doctor_controllers.dart';
import 'doctor_models.dart';
import 'doctor_repository.dart';
import 'doctor_visits_screen.dart';

/// 1.5 Үйлчлүүлэгчийн карт.
///
/// Тендер §1.5-д "Үйлчлүүлэгч модулийн (Эрсдэл, цахим үзлэг, Сэргээн засахын
/// модулыг харах боломжтой байна)" гэсэн. Эдгээрээс **цахим үзлэг** нь хуучин
/// жагсаалтаар харагдана; **эрсдэл** ба **сэргээн засах** хоёрыг эмчид өгөх
/// endpoint backend дээр байхгүй тул шалтгааныг нь илэн далангүй харуулна.
class DoctorPatientCardScreen extends StatefulWidget {
  const DoctorPatientCardScreen({
    super.key,
    required this.patientId,
    this.initialName,
  });

  final int patientId;
  final String? initialName;

  @override
  State<DoctorPatientCardScreen> createState() =>
      _DoctorPatientCardScreenState();
}

class _DoctorPatientCardScreenState extends State<DoctorPatientCardScreen>
    with SingleTickerProviderStateMixin {
  late final PatientCardController _controller;
  late final TabController _tabs = TabController(length: 4, vsync: this);

  @override
  void initState() {
    super.initState();
    _controller = PatientCardController(
      context.read<DoctorRepository>(),
      widget.patientId,
    );
    _controller.load();
  }

  @override
  void dispose() {
    _tabs.dispose();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider<PatientCardController>.value(
      value: _controller,
      child: Consumer<PatientCardController>(
        builder: (
          BuildContext context,
          PatientCardController controller,
          _,
        ) {
          final state = controller.card;
          final card = state.data;

          return Scaffold(
            appBar: AppBar(
              title: Text(
                card?.patient.fullName ??
                    widget.initialName ??
                    'Үйлчлүүлэгч',
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              bottom: TabBar(
                controller: _tabs,
                isScrollable: true,
                tabAlignment: TabAlignment.start,
                tabs: const <Widget>[
                  Tab(text: 'Товч'),
                  Tab(text: 'Үзлэг'),
                  Tab(text: 'Хэмжилт'),
                  Tab(text: 'Цахим үзлэг'),
                ],
              ),
            ),
            body: Builder(
              builder: (BuildContext context) {
                if (state.isFirstLoad) {
                  return const LoadingView(label: 'Карт уншиж байна…');
                }
                if (state.hasError && !state.hasData) {
                  return ErrorView(
                    error: state.error!,
                    onRetry: () => controller.load(refresh: true),
                  );
                }
                if (card == null) {
                  return const EmptyView(
                    title: 'Үйлчлүүлэгч олдсонгүй',
                    icon: Icons.person_off_outlined,
                  );
                }

                return TabBarView(
                  controller: _tabs,
                  children: <Widget>[
                    _SummaryTab(card: card, onToggle: _toggleMonitoring),
                    _VisitsTab(card: card),
                    _JournalTab(card: card),
                    const _EvisitsTab(),
                  ],
                );
              },
            ),
          );
        },
      ),
    );
  }

  Future<void> _toggleMonitoring() async {
    final error = await _controller.toggleMonitoring();
    if (!mounted) return;
    if (error != null) {
      AppSnack.error(context, error.message);
      return;
    }
    final nowMonitored = _controller.card.data?.isMonitoredByMe ?? false;
    AppSnack.success(
      context,
      nowMonitored ? 'Хяналтад нэмэгдлээ.' : 'Хяналтаас хаслаа.',
    );
  }
}

// ---------------------------------------------------------------------------

class _SummaryTab extends StatelessWidget {
  const _SummaryTab({required this.card, required this.onToggle});

  final PatientCard card;
  final Future<void> Function() onToggle;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final patient = card.patient;
    final busy = context.watch<PatientCardController>().monitoringBusy;

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      children: <Widget>[
        Row(
          children: <Widget>[
            CircleAvatar(
              radius: 28,
              backgroundColor:
                  theme.colorScheme.primary.withValues(alpha: 0.12),
              child: Text(
                patient.initials,
                style: theme.textTheme.titleLarge?.copyWith(
                  color: theme.colorScheme.primary,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(patient.fullName, style: theme.textTheme.titleMedium),
                  const SizedBox(height: 3),
                  Text(patient.subtitle, style: theme.textTheme.bodySmall),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        FilledButton.icon(
          onPressed: busy ? null : onToggle,
          style: card.isMonitoredByMe
              ? FilledButton.styleFrom(
                  backgroundColor: theme.colorScheme.surfaceContainerHighest,
                  foregroundColor: theme.colorScheme.onSurface,
                )
              : null,
          icon: busy
              ? const SizedBox(
                  width: 18,
                  height: 18,
                  child: CircularProgressIndicator(strokeWidth: 2.2),
                )
              : Icon(
                  card.isMonitoredByMe
                      ? Icons.person_remove_outlined
                      : Icons.person_add_alt_rounded,
                ),
          label: Text(
            card.isMonitoredByMe ? 'Хяналтаас хасах' : 'Хувийн хяналтад авах',
          ),
        ),
        const SizedBox(height: 16),
        SectionCard(
          title: 'Хувийн мэдээлэл',
          icon: Icons.badge_outlined,
          child: Column(
            children: <Widget>[
              InfoRow(label: 'Регистрийн дугаар', value: patient.registration),
              InfoRow(
                label: 'Төрсөн огноо',
                value: MnFormat.date(patient.birthday),
              ),
              InfoRow(
                label: 'Нас',
                value: patient.effectiveAge == null
                    ? ''
                    : '${patient.effectiveAge}',
              ),
              InfoRow(label: 'Утас', value: patient.telephone ?? ''),
              InfoRow(label: 'Нэмэлт утас', value: patient.telephone2 ?? ''),
              InfoRow(label: 'Хаяг', value: patient.address),
            ],
          ),
        ),
        const SizedBox(height: 14),
        const _UnavailableModulesNotice(),
      ],
    );
  }
}

/// Тендер §1.5-ын бүрэн хангагдаагүй хоёр хэсгийг нэрлэн тайлбарлана.
class _UnavailableModulesNotice extends StatelessWidget {
  const _UnavailableModulesNotice();

  @override
  Widget build(BuildContext context) {
    return const PendingModuleNotice(
      title: 'Эрсдэл үнэлгээ, Сэргээн засах',
      message: 'Үйлчлүүлэгчийн эрсдэлийн үзүүлэлт болон сэргээн засахын '
          'мэдээллийг эмчид харуулах холболт эмнэлгийн систем дээр хараахан '
          'бэлэн болоогүй байна. Одоогоор эдгээрийг МнКардио системийн вэб '
          'хувилбараас харна уу.',
      icon: Icons.link_off_rounded,
    );
  }
}

// ---------------------------------------------------------------------------

class _VisitsTab extends StatelessWidget {
  const _VisitsTab({required this.card});

  final PatientCard card;

  @override
  Widget build(BuildContext context) {
    if (card.visits.isEmpty) {
      return const EmptyView(
        title: 'Үзлэг байхгүй байна',
        message: 'Энэ үйлчлүүлэгчид бүртгэгдсэн үзлэг олдсонгүй.',
        icon: Icons.assignment_outlined,
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      itemCount: card.visits.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (BuildContext context, int index) => DoctorVisitTile(
        visit: card.visits[index],
        // Карт дотор аль хэдийн энэ хүний нэр гарсан тул давхардуулахгүй.
        showPatient: false,
      ),
    );
  }
}

// ---------------------------------------------------------------------------

class _JournalTab extends StatelessWidget {
  const _JournalTab({required this.card});

  final PatientCard card;

  @override
  Widget build(BuildContext context) {
    final summary = card.journal;

    if (summary.isEmpty) {
      return const EmptyView(
        title: 'Хэмжилт байхгүй байна',
        message: 'Үйлчлүүлэгч өдөр тутмын хэмжилтээ бүртгээгүй байна.',
        icon: Icons.monitor_heart_outlined,
      );
    }

    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      children: <Widget>[
        if (summary.hasBloodPressure)
          SectionCard(
            title: 'Цусны даралт',
            subtitle: 'мм.МУБ',
            icon: Icons.monitor_heart_outlined,
            child: MeasurementChart(
              labels: summary.labels,
              unit: 'мм.МУБ',
              series: <ChartSeries>[
                ChartSeries(
                  name: 'Дээд (систол)',
                  color: ChartPalette.systolic,
                  values: summary.systolic,
                ),
                ChartSeries(
                  name: 'Доод (диастол)',
                  color: ChartPalette.diastolic,
                  values: summary.diastolic,
                ),
              ],
            ),
          ),
        if (summary.hasPulse) ...<Widget>[
          const SizedBox(height: 12),
          SectionCard(
            title: 'Судасны цохилт',
            subtitle: 'уд/мин',
            icon: Icons.favorite_outline_rounded,
            child: MeasurementChart(
              labels: summary.labels,
              unit: 'уд/мин',
              series: <ChartSeries>[
                ChartSeries(
                  name: 'Судасны цохилт',
                  color: ChartPalette.pulse,
                  values: summary.pulse,
                ),
              ],
            ),
          ),
        ],
        if (summary.hasWeight) ...<Widget>[
          const SizedBox(height: 12),
          SectionCard(
            title: 'Жин',
            subtitle: 'кг',
            icon: Icons.scale_outlined,
            child: MeasurementChart(
              labels: summary.labels,
              unit: 'кг',
              series: <ChartSeries>[
                ChartSeries(
                  name: 'Жин',
                  color: ChartPalette.weight,
                  values: summary.weight,
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

// ---------------------------------------------------------------------------

class _EvisitsTab extends StatelessWidget {
  const _EvisitsTab();

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<PatientCardController>();
    final state = controller.evisits;
    final theme = Theme.of(context);

    if (state.isFirstLoad) {
      return const LoadingView(label: 'Цахим үзлэг уншиж байна…');
    }

    if (state.hasError) {
      // Шүүлтүүр баталгаажаагүй тохиолдолд өгөгдөл харуулахгүй — өөр хүний
      // мэдээлэл гарахаас сэргийлсэн санаатай шийдэл.
      return ErrorView(error: state.error!, onRetry: controller.loadEvisits);
    }

    final visits = state.data ?? const <DoctorEvisit>[];
    if (visits.isEmpty) {
      return const EmptyView(
        title: 'Хүсэлт байхгүй байна',
        message: 'Энэ үйлчлүүлэгч цахим үзлэгийн хүсэлт илгээгээгүй байна.',
        icon: Icons.duo_outlined,
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 32),
      itemCount: visits.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (BuildContext context, int index) {
        final visit = visits[index];
        return SectionCard(
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Row(
                children: <Widget>[
                  Icon(
                    Icons.duo_outlined,
                    size: 16,
                    color: theme.colorScheme.primary,
                  ),
                  const SizedBox(width: 7),
                  Text('Хүсэлт', style: theme.textTheme.titleSmall),
                  const Spacer(),
                  Text(
                    MnFormat.friendlyDate(visit.createDate),
                    style: theme.textTheme.bodySmall,
                  ),
                ],
              ),
              const SizedBox(height: 9),
              Text(visit.comment, style: theme.textTheme.bodyMedium),
            ],
          ),
        );
      },
    );
  }
}
