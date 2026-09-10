import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/util/mn_format.dart';
import '../../core/util/validators.dart';
import '../../shared/widgets/app_snack.dart';
import '../../shared/widgets/paged_list_view.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'evisit.dart';
import 'evisits_controller.dart';

/// 2.6 Цахим үзлэг.
///
/// Одоогийн backend дээр энэ нь **хүсэлт бүртгэх хайрцаг** — цаг захиалах,
/// төлөв хянах, эмч хуваарилах, видео дуудлага хийх боломж системд байхгүй
/// (API.md §3, 2.6). Тиймээс байхгүй боломжийг байгаа мэт харагдуулахгүйгээр
/// хүсэлт үлдээх урсгалыг бүрэн гүйцэд хийж өгнө.
class EvisitsScreen extends StatefulWidget {
  const EvisitsScreen({super.key});

  @override
  State<EvisitsScreen> createState() => _EvisitsScreenState();
}

class _EvisitsScreenState extends State<EvisitsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final controller = context.read<EvisitsController>();
      if (controller.state.isIdle) controller.load();
    });
  }

  @override
  Widget build(BuildContext context) {
    final controller = context.watch<EvisitsController>();

    return Scaffold(
      appBar: AppBar(title: const Text('Цахим үзлэг')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _openForm,
        icon: const Icon(Icons.add_rounded),
        label: const Text('Хүсэлт илгээх'),
      ),
      body: PagedListView<Evisit>(
        controller: controller,
        loadingLabel: 'Хүсэлтүүд уншиж байна…',
        header: const Padding(
          padding: EdgeInsets.only(bottom: 14),
          child: PendingModuleNotice(
            title: 'Цаг захиалга ба видео дуудлага',
            message: 'Одоогоор та цахим үзлэгийн хүсэлтээ бичиж илгээх '
                'боломжтой. Эмнэлгийн ажилтан хүсэлттэй танилцаад тантай '
                'холбогдоно. Цаг товлох, видео дуудлагаар үзлэг хийх '
                'боломжийг эмнэлгийн систем дээр нэмэх ажил хийгдэж байна.',
            icon: Icons.videocam_off_outlined,
          ),
        ),
        itemBuilder: (BuildContext context, Evisit item, _) =>
            _EvisitTile(evisit: item),
        empty: const EmptyView(
          title: 'Хүсэлт байхгүй байна',
          message: 'Эмнэлэгт очихгүйгээр эмчид хандах шаардлагатай бол '
              'доорх товчоор хүсэлтээ илгээнэ үү.',
          icon: Icons.duo_outlined,
        ),
      ),
    );
  }

  Future<void> _openForm() async {
    final controller = context.read<EvisitsController>();
    final text = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      builder: (_) => const _EvisitComposerSheet(),
    );
    if (text == null || text.trim().isEmpty) return;

    final error = await controller.create(text);
    if (!mounted) return;
    if (error != null) {
      AppSnack.error(context, error.message);
    } else {
      AppSnack.success(context, 'Хүсэлт илгээгдлээ.');
    }
  }
}

class _EvisitTile extends StatelessWidget {
  const _EvisitTile({required this.evisit});

  final Evisit evisit;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SectionCard(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Icon(
                Icons.duo_outlined,
                size: 17,
                color: theme.colorScheme.primary,
              ),
              const SizedBox(width: 8),
              Text('Цахим үзлэгийн хүсэлт',
                  style: theme.textTheme.titleSmall),
              const Spacer(),
              Text(
                MnFormat.friendlyDate(evisit.createDate),
                style: theme.textTheme.bodySmall,
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(evisit.comment, style: theme.textTheme.bodyMedium),
          const SizedBox(height: 8),
          Text(
            MnFormat.dateTime(evisit.createDate),
            style: theme.textTheme.bodySmall?.copyWith(fontSize: 11.5),
          ),
        ],
      ),
    );
  }
}

class _EvisitComposerSheet extends StatefulWidget {
  const _EvisitComposerSheet();

  @override
  State<_EvisitComposerSheet> createState() => _EvisitComposerSheetState();
}

class _EvisitComposerSheetState extends State<_EvisitComposerSheet> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _input = TextEditingController();

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.viewInsetsOf(context).bottom,
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 4, 20, 20),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text('Цахим үзлэгийн хүсэлт',
                    style: theme.textTheme.titleMedium),
                const SizedBox(height: 6),
                Text(
                  'Ямар шалтгаанаар хандаж байгаагаа, биеийн байдал болон '
                  'санаа зовоож буй зүйлээ дэлгэрэнгүй бичнэ үү.',
                  style: theme.textTheme.bodySmall,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _input,
                  autofocus: true,
                  minLines: 4,
                  maxLines: 8,
                  maxLength: 2000,
                  textCapitalization: TextCapitalization.sentences,
                  decoration: const InputDecoration(
                    hintText: 'Хүсэлтээ бичнэ үү…',
                  ),
                  validator: (String? v) => Validators.comment(v),
                ),
                const SizedBox(height: 12),
                Row(
                  children: <Widget>[
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Болих'),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        onPressed: () {
                          if (_formKey.currentState?.validate() ?? false) {
                            Navigator.of(context).pop(_input.text);
                          }
                        },
                        child: const Text('Илгээх'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
