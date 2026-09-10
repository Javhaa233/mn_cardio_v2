import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../../core/network/api_exception.dart';
import '../../shared/widgets/section_card.dart';
import '../../shared/widgets/state_views.dart';
import 'chat_models.dart';
import 'chat_repository.dart';

/// Эмчийн лавлах — яриа эхлүүлэх хүнээ сонгох.
///
/// Сервер тал үйлчлүүлэгчийн хайлтыг **эмчилж буй багаар нь хязгаарладаг**
/// бөгөөд эмчийн имэйл, утсыг хариунаас зориудаар хасдаг. Тиймээс энд бүх
/// эмчийн жагсаалт харагдахгүй байх нь хэвийн.
class DoctorDirectoryScreen extends StatefulWidget {
  const DoctorDirectoryScreen({super.key});

  @override
  State<DoctorDirectoryScreen> createState() => _DoctorDirectoryScreenState();
}

class _DoctorDirectoryScreenState extends State<DoctorDirectoryScreen> {
  final TextEditingController _search = TextEditingController();
  Timer? _debounce;

  List<DirectoryPerson> _people = const <DirectoryPerson>[];
  bool _loading = true;
  ApiException? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _search.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final result = await context
          .read<ChatRepository>()
          .searchDoctors(search: _search.text);
      if (!mounted) return;
      setState(() {
        _people = result;
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

  void _onSearchChanged(String _) {
    _debounce?.cancel();
    // Сервер талд хайлтын давтамжийн хязгаарлалт бий тул товч дарах бүрд
    // хүсэлт явуулахгүй.
    _debounce = Timer(const Duration(milliseconds: 450), _load);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Эмч хайх')),
      body: Column(
        children: <Widget>[
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
            child: TextField(
              controller: _search,
              onChanged: _onSearchChanged,
              textInputAction: TextInputAction.search,
              onSubmitted: (_) => _load(),
              decoration: InputDecoration(
                hintText: 'Эмчийн нэр, мэргэжлээр хайх',
                prefixIcon: const Icon(Icons.search_rounded),
                suffixIcon: _search.text.isEmpty
                    ? null
                    : IconButton(
                        icon: const Icon(Icons.close_rounded),
                        onPressed: () {
                          _search.clear();
                          _load();
                        },
                      ),
              ),
            ),
          ),
          Expanded(child: _buildBody()),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) return const LoadingView(label: 'Хайж байна…');

    final error = _error;
    if (error != null) {
      return ErrorView(error: error, onRetry: _load);
    }

    if (_people.isEmpty) {
      return EmptyView(
        title: _search.text.trim().isEmpty
            ? 'Эмч олдсонгүй'
            : 'Хайлтад тохирох эмч олдсонгүй',
        message: _search.text.trim().isEmpty
            ? 'Танд одоогоор эмчилгээний баг хуваарилагдаагүй байж болно. '
                'Эмнэлэгт хандаж лавлана уу.'
            : 'Өөр түлхүүр үгээр хайж үзнэ үү.',
        icon: Icons.person_search_outlined,
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
      itemCount: _people.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (BuildContext context, int index) {
        final person = _people[index];
        return SectionCard(
          padding: const EdgeInsets.fromLTRB(14, 12, 14, 12),
          onTap: () => Navigator.of(context).pop(person),
          child: Row(
            children: <Widget>[
              CircleAvatar(
                radius: 22,
                backgroundColor: Theme.of(context)
                    .colorScheme
                    .primary
                    .withValues(alpha: 0.12),
                child: Icon(
                  Icons.medical_services_outlined,
                  size: 20,
                  color: Theme.of(context).colorScheme.primary,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      person.name,
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                    if (person.subtitle.isNotEmpty) ...<Widget>[
                      const SizedBox(height: 3),
                      Text(
                        person.subtitle,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ],
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded, size: 20),
            ],
          ),
        );
      },
    );
  }
}
