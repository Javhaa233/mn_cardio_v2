import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:just_audio/just_audio.dart';

import '../../core/network/api_exception.dart';
import 'rehab_controller.dart';
import 'rehab_player_models.dart';

/// Тоглуулагчийн нэг алхам.
enum RehabStepKind {
  /// "Дараагийн дасгал" — бэлтгэх хугацаа.
  preview,

  /// Давтагдах бичлэгтэй хөдөлгөөн (цагаар эсвэл тоогоор).
  movement,

  /// Алхах, дугуй жийх, шатаар алхах — 2 минут тутам пульс оруулна.
  timed,

  /// Амин үзүүлэлт хэмжих.
  vitals,

  /// Зураг, заавар (бичлэггүй хэсэг).
  guide,

  /// Хөдөлгөөн хоорондын амралт (RehabMovement.RestSec).
  rest,
}

class RehabStep {
  const RehabStep({
    required this.kind,
    required this.block,
    required this.blockIndex,
    this.movement,
    this.durationSec,
    this.nextKind,
    this.lastOfBlock = false,
    this.setNo = 1,
    this.setCount = 1,
    this.exerciseWarning,
  });

  final RehabStepKind kind;
  final RehabBlock block;
  final int blockIndex;
  final RehabMovement? movement;

  /// Хэд дэх сет (1-ээс). Сет хоорондын амралт дээр — ДАРААГИЙН сет.
  final int setNo;
  final int setCount;

  /// Дасгалын анхааруулга — зөвхөн эхний хөдөлгөөний бэлтгэл дээр.
  final String? exerciseWarning;

  /// Нэг хөдөлгөөний сет хоорондын амралт (дараа нь мөн л энэ хөдөлгөөн).
  bool get isSetRest => kind == RehabStepKind.rest && setNo > 1;

  /// null — хэрэглэгч "Дууссан" дарж шилжинэ (тоогоор хийх, заавар).
  final int? durationSec;

  /// Урьдчилан харах алхам юуны өмнө байгааг заана.
  final RehabStepKind? nextKind;
  final bool lastOfBlock;

  String get title => movement?.name ?? block.title;
}

/// Дасгалын явцыг удирдана: алхмууд, цаг, 3-2-1 дохио, пульсын хэмжилт.
///
/// Дэлгэц нимгэн байхын тулд бүх төлөв энд. Серверт зөвхөн хэмжилт болон
/// эцсийн дүн очно; сүлжээ тасарвал хэмжилт дараалалд хадгалагдаж, дуусгах
/// хүсэлттэй хамт илгээгдэнэ (API.md §2.7c).
class RehabPlayerController extends ChangeNotifier {
  RehabPlayerController({
    required this.rehab,
    required this.session,
    required List<RehabBlock> blocks,
    required this.files,
  }) : steps = _buildSteps(blocks) {
    _loadSounds();
  }

  final RehabController rehab;
  final RehabSessionStart session;
  final List<RehabStep> steps;

  /// Хөдөлгөөний Id → урьдчилан татсан бичлэг.
  final Map<int, File> files;

  // ------------------------------------------------------------ төлөв
  int _index = 0;
  int? _remaining;
  int _elapsedInStep = 0;
  int _sessionSec = 0;
  bool _paused = true;
  bool _started = false;
  bool _finished = false;
  bool _checkinDue = false;
  bool _muted = false;
  int _skipped = 0;
  final Set<int> _completedBlocks = <int>{};
  final Set<int> _completedExercises = <int>{};
  final List<RehabCheckin> _checkins = <RehabCheckin>[];
  final List<RehabCheckin> _unsent = <RehabCheckin>[];
  Timer? _timer;

  int get index => _index;
  RehabStep get step => steps[_index];
  RehabStep? get nextStep =>
      _index + 1 < steps.length ? steps[_index + 1] : null;
  int? get remaining => _remaining;
  int get elapsedInStep => _elapsedInStep;
  int get sessionSec => _sessionSec;
  bool get paused => _paused;
  bool get finished => _finished;
  bool get checkinDue => _checkinDue;
  bool get muted => _muted;
  bool get hasSteps => steps.isNotEmpty;
  List<RehabCheckin> get checkins => List<RehabCheckin>.unmodifiable(_checkins);
  int? get targetHr => session.targetHr;
  RehabCheckin? get lastCheckin => _checkins.isEmpty ? null : _checkins.last;

  /// Явцын туузад: хэсэг бүрийн дугаар ба одоогийн хэсэг.
  int get blockCount => steps.isEmpty
      ? 0
      : steps.map((RehabStep s) => s.blockIndex).toSet().length;
  int get currentBlockOrdinal {
    if (steps.isEmpty) return 0;
    final ids = <int>[];
    for (final s in steps) {
      if (!ids.contains(s.blockIndex)) ids.add(s.blockIndex);
    }
    return ids.indexOf(step.blockIndex);
  }

  /// Хөдөлгөөний дугаар ба нийт тоо ("3/14") — дээд мөрөнд.
  /// Сетүүдийг нэг хөдөлгөөн гэж тоолно (1-р сетийн алхмаар).
  static bool _isFirstSet(RehabStep s) =>
      s.kind == RehabStepKind.movement && s.setNo == 1;

  int get movementTotal => steps.where(_isFirstSet).length;

  int get movementOrdinal {
    var n = 0;
    for (var i = 0; i <= _index && i < steps.length; i++) {
      if (_isFirstSet(steps[i])) n++;
    }
    // Бэлтгэл/амралт дээр байхад дараагийнхыг нь заана — сет хоорондын
    // амралтаас бусад үед (тэнд дараагийнх нь мөн л энэ хөдөлгөөн).
    final between = step.kind == RehabStepKind.movement || step.isSetRest;
    if (!between && n < movementTotal) n += 1;
    return n == 0 ? 1 : n;
  }

  // ------------------------------------------------------------ мессеж
  String? _cueText;
  int _cueLeft = 0;

  /// Бичлэг дээр одоо харагдах мессеж (API.md §2.7c "Cues"), эсвэл null.
  String? get activeCue => _cueText;

  void _showCue(RehabCue? cue) {
    if (cue == null) return;
    _cueText = cue.text;
    _cueLeft = cueVisibleSec;
    HapticFeedback.selectionClick();
  }

  /// Мессежийг хүрч хаах.
  void dismissCue() {
    _cueText = null;
    _cueLeft = 0;
    notifyListeners();
  }

  /// Сет эхлэхэд: тухайн сетийн мессеж, эсвэл 1-р сетэд эхлэлийн мессеж.
  void _cueOnEnter(RehabStep s) {
    final m = s.movement;
    if (s.kind != RehabStepKind.movement || m == null) return;
    RehabCue? hit;
    for (final c in m.cues) {
      if (c.isSet && c.atSet == s.setNo) hit = c;
    }
    if (hit == null && s.setNo == 1) {
      for (final c in m.cues) {
        if (c.isStart) {
          hit = c;
          break;
        }
      }
    }
    _showCue(hit);
  }

  /// Ажлын N дахь секундийн мессеж — сет бүрт, цагаар хийх үед.
  void _cueOnSecond(RehabStep s) {
    final m = s.movement;
    if (s.kind != RehabStepKind.movement || m == null || m.isCounted) return;
    for (final c in m.cues) {
      if (!c.isSet && (c.atSec ?? 0) > 0 && c.atSec == _elapsedInStep) {
        _showCue(c);
      }
    }
  }

  /// Одоогийн алхмын явц 0..1 (цагтай алхамд).
  double get stepProgress {
    final total = step.durationSec;
    final left = _remaining;
    if (total == null || total <= 0 || left == null) return 0;
    return (1 - left / total).clamp(0.0, 1.0);
  }

  // ------------------------------------------------------------ бүтэц
  static List<RehabStep> _buildSteps(List<RehabBlock> blocks) {
    final out = <RehabStep>[];
    var bi = 0;
    for (final block in blocks) {
      if (block.locked) continue;
      if (block.isVideo && block.movements.isNotEmpty) {
        for (var i = 0; i < block.movements.length; i++) {
          final m = block.movements[i];
          final last = i == block.movements.length - 1;
          out.add(RehabStep(
            kind: RehabStepKind.preview,
            block: block,
            blockIndex: bi,
            movement: m,
            durationSec: m.prepSec,
            nextKind: RehabStepKind.movement,
            setCount: m.sets,
            exerciseWarning: i == 0 ? block.exerciseWarning : null,
          ));
          // Сет бүр тусдаа алхам; хооронд нь SetRestSec амралт (API.md §2.7c).
          for (var s = 1; s <= m.sets; s++) {
            out.add(RehabStep(
              kind: RehabStepKind.movement,
              block: block,
              blockIndex: bi,
              movement: m,
              durationSec: m.isCounted ? null : (m.workSec ?? 30),
              lastOfBlock: last && s == m.sets,
              setNo: s,
              setCount: m.sets,
            ));
            if (s < m.sets && (m.setRestSec ?? 0) > 0) {
              out.add(RehabStep(
                kind: RehabStepKind.rest,
                block: block,
                blockIndex: bi,
                movement: m,
                durationSec: m.setRestSec,
                setNo: s + 1,
                setCount: m.sets,
              ));
            }
          }
          // Амралт зөвхөн заасан үед, бөгөөд хэсгийн сүүлчийн хөдөлгөөний
          // дараа биш — тэнд дараагийн хэсгийн бэлтгэл өөрөө завсарлага болно.
          if ((m.restSec ?? 0) > 0 && i != block.movements.length - 1) {
            out.add(RehabStep(
              kind: RehabStepKind.rest,
              block: block,
              blockIndex: bi,
              // Дараагийн хөдөлгөөнийг зурагтай нь харуулна.
              movement: block.movements[i + 1],
              durationSec: m.restSec,
            ));
          }
        }
      } else if (block.isTimed) {
        out.add(RehabStep(
          kind: RehabStepKind.preview,
          block: block,
          blockIndex: bi,
          durationSec: 10,
          nextKind: RehabStepKind.timed,
        ));
        out.add(RehabStep(
          kind: RehabStepKind.timed,
          block: block,
          blockIndex: bi,
          durationSec: block.durationSec ?? 600,
          lastOfBlock: true,
        ));
      } else if (block.isVitals) {
        out.add(RehabStep(
          kind: RehabStepKind.vitals,
          block: block,
          blockIndex: bi,
          lastOfBlock: true,
        ));
      } else {
        // Зураг, эсвэл бичлэг нь хараахан бэлэн болоогүй видео хэсэг.
        out.add(RehabStep(
          kind: RehabStepKind.guide,
          block: block,
          blockIndex: bi,
          durationSec: block.isImage ? null : block.durationSec,
          lastOfBlock: true,
        ));
      }
      bi++;
    }
    return out;
  }

  // ------------------------------------------------------------ дуу
  final AudioPlayer _tick = AudioPlayer();
  final AudioPlayer _go = AudioPlayer();

  Future<void> _loadSounds() async {
    try {
      await _tick.setAsset('assets/sounds/beep_tick.wav');
      await _go.setAsset('assets/sounds/beep_go.wav');
    } catch (_) {
      // Дуугүй ч тоглуулагч ажиллана.
    }
  }

  void _beep(AudioPlayer p) {
    if (_muted) return;
    unawaited(p.seek(Duration.zero).then((_) => p.play()).catchError((_) {}));
  }

  void toggleMute() {
    _muted = !_muted;
    notifyListeners();
  }

  // ------------------------------------------------------------ цаг
  void start() {
    if (_started || steps.isEmpty) return;
    _started = true;
    _enterStep(0);
    _paused = false;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _tickSecond());
    notifyListeners();
  }

  void _enterStep(int i) {
    _index = i;
    _elapsedInStep = 0;
    _remaining = steps[i].durationSec;
    _checkinDue = false;
    _cueText = null;
    _cueLeft = 0;
    _cueOnEnter(steps[i]);
  }

  void _tickSecond() {
    if (_paused || _finished || _checkinDue) return;
    _sessionSec++;
    _elapsedInStep++;

    if (_cueLeft > 0) {
      _cueLeft--;
      if (_cueLeft == 0) _cueText = null;
    }
    _cueOnSecond(step);

    final s = step;
    if (s.kind == RehabStepKind.timed) {
      final every = s.block.checkInEverySec ?? 120;
      if (every > 0 && _elapsedInStep % every == 0 && (_remaining ?? 0) > 1) {
        _checkinDue = true;
        HapticFeedback.heavyImpact();
        _beep(_go);
      }
    }

    final left = _remaining;
    if (left != null) {
      _remaining = left - 1;
      if (_remaining! <= 3 && _remaining! >= 1) _beep(_tick);
      if (_remaining! <= 0) {
        _beep(_go);
        HapticFeedback.mediumImpact();
        _advance(completed: true);
        return;
      }
    }
    notifyListeners();
  }

  void togglePause() {
    if (_finished) return;
    _paused = !_paused;
    notifyListeners();
  }

  void pause() {
    if (_paused || _finished) return;
    _paused = true;
    notifyListeners();
  }

  /// "+10 сек" — зөвхөн урьдчилан харах үед.
  void addTenSeconds() {
    if (step.kind != RehabStepKind.preview || _remaining == null) return;
    _remaining = _remaining! + 10;
    notifyListeners();
  }

  // ------------------------------------------------------------ шилжих
  void _advance({required bool completed}) {
    final s = step;
    if (completed && s.lastOfBlock) {
      _completedBlocks.add(s.blockIndex);
      final exId = s.block.exerciseId;
      if (exId != null && s.block.isVideo) _completedExercises.add(exId);
    }
    if (_index + 1 >= steps.length) {
      _finished = true;
      _paused = true;
      notifyListeners();
      return;
    }
    _enterStep(_index + 1);
    notifyListeners();
  }

  /// "Одоо эхлэх", "Дууссан", ⏭.
  ///
  /// Хөдөлгөөнийг алгасвал дараагийн "Дараагийн дасгал" руу очно (сонголт §4).
  void next() {
    final s = step;
    final early = s.kind == RehabStepKind.movement ||
        s.kind == RehabStepKind.timed ||
        s.kind == RehabStepKind.guide;
    // Амралтыг алгасах нь дасгал алгассан гэсэн үг биш.
    final done = (_remaining == null) || (_remaining ?? 0) <= 0;
    if (early && !done) _skipped++;
    _advance(completed: s.kind != RehabStepKind.preview && (done || !early));
    if (_paused && !_finished) _paused = false;
    notifyListeners();
  }

  /// ⏮ — өмнөх хөдөлгөөний бэлтгэл рүү.
  void previous() {
    if (_index == 0) return;
    var target = step.kind == RehabStepKind.preview ? _index - 1 : _index;
    // Одоогийн алхмын эхлэл (бэлтгэл) рүү, түүнээс өмнөх бол нэг алхам хойш.
    while (target > 0 && steps[target].kind != RehabStepKind.preview) {
      target--;
    }
    if (target == _index && target > 0) {
      target--;
      while (target > 0 && steps[target].kind != RehabStepKind.preview) {
        target--;
      }
    }
    _enterStep(target);
    _paused = false;
    notifyListeners();
  }

  // ------------------------------------------------------------ хэмжилт
  /// Пульс ба CR10. Бүсийг шууд тооцоод харуулна; сервер рүү арын горимд илгээнэ.
  RehabCheckin submitCheckin({int? pulse, int? borg}) {
    final value = RehabCheckin(
      atSec: _sessionSec,
      pulse: pulse,
      borg: borg,
      zone: hrZoneLocal(pulse, session.targetHr),
    );
    _checkins.add(value);
    _checkinDue = false;
    notifyListeners();
    unawaited(_send(value));
    return value;
  }

  void skipCheckin() {
    _checkinDue = false;
    notifyListeners();
  }

  Future<void> _send(RehabCheckin value) async {
    try {
      await rehab.repository.checkin(session.id, value);
    } on ApiException {
      _unsent.add(value);
    } catch (_) {
      _unsent.add(value);
    }
  }

  // ------------------------------------------------------------ дуусгах
  RehabFinishDraft buildFinish({
    required String status,
    List<String> symptoms = const <String>[],
    String? note,
  }) {
    return RehabFinishDraft(
      sessionId: session.id,
      status: status,
      durationSec: _sessionSec,
      completedBlocks: _completedBlocks.length,
      skippedMovements: _skipped,
      // Бүх хэмжилтийг дахин явуулна — `AtSec` давхардлыг сервер шүүнэ.
      checkins: List<RehabCheckin>.of(_checkins),
      completedExerciseIds: _completedExercises.toList(growable: false),
      symptoms: symptoms,
      note: note,
    );
  }

  void halt() {
    _paused = true;
    _finished = true;
    _timer?.cancel();
    notifyListeners();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _tick.dispose();
    _go.dispose();
    super.dispose();
  }
}
