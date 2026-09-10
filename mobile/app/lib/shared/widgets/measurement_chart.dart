import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';

import '../../core/util/mn_format.dart';
import '../theme/app_colors.dart';

/// Графикт зурагдах нэг цуваа.
class ChartSeries {
  const ChartSeries({
    required this.name,
    required this.color,
    required this.values,
  });

  final String name;
  final Color color;
  final List<double?> values;

  bool get hasData => values.any((double? v) => v != null);
}

/// Хэмжилтийн шугаман график.
///
/// Сервер тал `labels` ба `series`-ийг эрэмбэлж, тэгшитгэж өгдөг тул энд
/// зөвхөн зурна — тооцоолол хийхгүй (API.md §3, 2.2).
class MeasurementChart extends StatelessWidget {
  const MeasurementChart({
    super.key,
    required this.labels,
    required this.series,
    this.unit = '',
    this.height = 220,
    this.minY,
    this.maxY,
  });

  final List<String> labels;
  final List<ChartSeries> series;
  final String unit;
  final double height;
  final double? minY;
  final double? maxY;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final visible = series.where((ChartSeries s) => s.hasData).toList();

    if (labels.isEmpty || visible.isEmpty) {
      return SizedBox(
        height: height,
        child: Center(
          child: Text(
            'Энэ хугацаанд хэмжилт бүртгэгдээгүй байна.',
            style: theme.textTheme.bodySmall,
            textAlign: TextAlign.center,
          ),
        ),
      );
    }

    final bounds = _bounds(visible);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        SizedBox(
          height: height,
          child: LineChart(
            LineChartData(
              minY: minY ?? bounds.$1,
              maxY: maxY ?? bounds.$2,
              minX: 0,
              maxX: (labels.length - 1).toDouble(),
              clipData: const FlClipData.all(),
              gridData: FlGridData(
                show: true,
                drawVerticalLine: false,
                horizontalInterval: bounds.$3,
                getDrawingHorizontalLine: (double value) => FlLine(
                  color: theme.dividerColor.withValues(alpha: 0.5),
                  strokeWidth: 1,
                  dashArray: const <int>[4, 4],
                ),
              ),
              borderData: FlBorderData(show: false),
              titlesData: FlTitlesData(
                topTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false),
                ),
                rightTitles: const AxisTitles(
                  sideTitles: SideTitles(showTitles: false),
                ),
                leftTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 40,
                    interval: bounds.$3,
                    getTitlesWidget: (double value, TitleMeta meta) {
                      if (value == meta.max) return const SizedBox.shrink();
                      return Padding(
                        padding: const EdgeInsets.only(right: 6),
                        child: Text(
                          MnFormat.number(value, decimals: 0),
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontSize: 11,
                          ),
                          textAlign: TextAlign.right,
                        ),
                      );
                    },
                  ),
                ),
                bottomTitles: AxisTitles(
                  sideTitles: SideTitles(
                    showTitles: true,
                    reservedSize: 30,
                    interval: _labelInterval(labels.length),
                    getTitlesWidget: (double value, TitleMeta meta) {
                      final index = value.round();
                      if (index < 0 || index >= labels.length) {
                        return const SizedBox.shrink();
                      }
                      return Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(
                          _shortLabel(labels[index]),
                          style: theme.textTheme.bodySmall?.copyWith(
                            fontSize: 10.5,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
              lineTouchData: LineTouchData(
                touchTooltipData: LineTouchTooltipData(
                  getTooltipColor: (LineBarSpot spot) =>
                      theme.colorScheme.inverseSurface.withValues(alpha: 0.92),
                  getTooltipItems: (List<LineBarSpot> spots) {
                    return spots.map((LineBarSpot spot) {
                      final s = visible[spot.barIndex];
                      final index = spot.x.round();
                      final label = index >= 0 && index < labels.length
                          ? _shortLabel(labels[index])
                          : '';
                      return LineTooltipItem(
                        '${s.name}: ${MnFormat.number(spot.y)}'
                        '${unit.isEmpty ? '' : ' $unit'}\n$label',
                        TextStyle(
                          color: theme.colorScheme.onInverseSurface,
                          fontSize: 12,
                          height: 1.4,
                          fontWeight: FontWeight.w500,
                        ),
                      );
                    }).toList();
                  },
                ),
              ),
              lineBarsData: visible
                  .map(
                    (ChartSeries s) => LineChartBarData(
                      spots: _spots(s.values),
                      isCurved: true,
                      curveSmoothness: 0.22,
                      preventCurveOverShooting: true,
                      color: s.color,
                      barWidth: 2.4,
                      dotData: FlDotData(
                        show: labels.length <= 31,
                        getDotPainter: (
                          FlSpot spot,
                          double percent,
                          LineChartBarData bar,
                          int index,
                        ) =>
                            FlDotCirclePainter(
                          radius: 2.8,
                          color: s.color,
                          strokeWidth: 1.4,
                          strokeColor: theme.colorScheme.surface,
                        ),
                      ),
                      belowBarData: BarAreaData(
                        show: visible.length == 1,
                        color: s.color.withValues(alpha: 0.10),
                      ),
                    ),
                  )
                  .toList(),
            ),
          ),
        ),
        const SizedBox(height: 14),
        Wrap(
          spacing: 16,
          runSpacing: 8,
          children: visible
              .map(
                (ChartSeries s) => Row(
                  mainAxisSize: MainAxisSize.min,
                  children: <Widget>[
                    Container(
                      width: 12,
                      height: 3,
                      decoration: BoxDecoration(
                        color: s.color,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(s.name, style: theme.textTheme.bodySmall),
                  ],
                ),
              )
              .toList(),
        ),
      ],
    );
  }

  List<FlSpot> _spots(List<double?> values) {
    final spots = <FlSpot>[];
    for (var i = 0; i < values.length; i++) {
      final v = values[i];
      if (v == null) continue;
      spots.add(FlSpot(i.toDouble(), v));
    }
    return spots;
  }

  /// (minY, maxY, interval)
  (double, double, double) _bounds(List<ChartSeries> visible) {
    var min = double.infinity;
    var max = double.negativeInfinity;
    for (final s in visible) {
      for (final v in s.values) {
        if (v == null) continue;
        if (v < min) min = v;
        if (v > max) max = v;
      }
    }
    if (min == double.infinity) return (0, 10, 5);

    final span = (max - min).abs();
    final padding = span < 1 ? 2.0 : span * 0.18;
    final low = (min - padding).floorToDouble();
    final high = (max + padding).ceilToDouble();
    // `num.clamp` нь `num` буцаадаг тул `double` руу шууд оноож болохгүй.
    final interval =
        ((high - low) / 4).ceilToDouble().clamp(1.0, 1000.0).toDouble();
    return (low, high, interval);
  }

  double _labelInterval(int count) {
    if (count <= 7) return 1;
    return (count / 5).ceilToDouble();
  }

  /// `2026-09-10` → `09.10`
  String _shortLabel(String raw) {
    final parsed = DateTime.tryParse(raw);
    if (parsed != null) {
      return '${parsed.month.toString().padLeft(2, '0')}.'
          '${parsed.day.toString().padLeft(2, '0')}';
    }
    if (raw.length > 5) return raw.substring(raw.length - 5);
    return raw;
  }
}

/// Даралт, судасны цохилтын графикт хэрэглэгдэх стандарт өнгө.
class ChartPalette {
  ChartPalette._();

  static const Color systolic = AppColors.chartSystolic;
  static const Color diastolic = AppColors.chartDiastolic;
  static const Color pulse = AppColors.chartPulse;
  static const Color weight = AppColors.chartWeight;
  static const Color spo2 = AppColors.chartSpo2;
}
