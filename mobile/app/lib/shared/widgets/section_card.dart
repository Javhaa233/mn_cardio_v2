import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import '../theme/app_theme.dart';

/// Гарчигтай хэсгийг ялгах карт.
class SectionCard extends StatelessWidget {
  const SectionCard({
    super.key,
    this.title,
    this.subtitle,
    this.trailing,
    this.icon,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.onTap,
  });

  final String? title;
  final String? subtitle;
  final Widget? trailing;
  final IconData? icon;
  final Widget child;
  final EdgeInsets padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final header = title;

    // HeartFit карт: тод гарчиг, доор нь шууд агуулга — зураасгүй. Гарчиг
    // ба агуулгыг тусад нь Padding-лэсэн нь гарчгийн мөрөнд trailing товч
    // багтаах зайг хадгалахад.
    final content = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        if (header != null) ...<Widget>[
          Padding(
            // Вебийн UniCard: гарчгийн дээд, доод зай тэнцүү.
            padding: EdgeInsets.fromLTRB(
              padding.left,
              padding.top,
              padding.right,
              10,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                if (icon != null) ...<Widget>[
                  IconBubble(icon: icon!, color: theme.colorScheme.primary),
                  const SizedBox(width: 12),
                ],
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      // Вебийн h3 — картын гарчгийн хэмжээ.
                      Text(header, style: theme.textTheme.titleLarge),
                      if (subtitle != null) ...<Widget>[
                        const SizedBox(height: 4),
                        Text(subtitle!, style: theme.textTheme.bodySmall),
                      ],
                    ],
                  ),
                ),
                if (trailing != null) trailing!,
              ],
            ),
          ),
        ],
        Padding(
          padding: EdgeInsets.fromLTRB(
            padding.left,
            header == null ? padding.top : 0,
            padding.right,
            padding.bottom,
          ),
          child: child,
        ),
      ],
    );

    return Card(
      clipBehavior: Clip.antiAlias,
      child: onTap == null ? content : InkWell(onTap: onTap, child: content),
    );
  }
}

/// Шошго — утга хос. Урт монгол шошго багтахгүй үед доош мөр шилжинэ.
class InfoRow extends StatelessWidget {
  const InfoRow({
    super.key,
    required this.label,
    required this.value,
    this.valueStyle,
    this.dense = false,
  });

  final String label;
  final String value;
  final TextStyle? valueStyle;
  final bool dense;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.symmetric(vertical: dense ? 5 : 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 132,
            child: Text(label, style: theme.textTheme.bodySmall),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              value.trim().isEmpty ? '—' : value,
              style: valueStyle ??
                  theme.textTheme.bodyMedium?.copyWith(
                    fontWeight: FontWeight.w500,
                  ),
            ),
          ),
        ],
      ),
    );
  }
}

/// Тоон үзүүлэлтийн жижиг хайрцаг — хяналтын самбарт.
class StatTile extends StatelessWidget {
  const StatTile({
    super.key,
    required this.label,
    required this.value,
    this.unit,
    this.color,
    this.icon,
  });

  final String label;
  final String value;
  final String? unit;
  final Color? color;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final accent = color ?? theme.colorScheme.primary;
    // HeartFit-ийн үзүүлэлтийн хавтан: цагаан, хүрээгүй, зөөлөн сүүдэр;
    // шошго дээрээ, доор нь том тод тоо бэхний өнгөөр. Өнгийг зөвхөн
    // дүрсэнд үлдээв — тоог өнгөөр будвал зэрэгцээ хавтан бүр өөр өнгөтэй
    // болж, аль нь эмнэлзүйн хувьд чухал болох нь алдагдана.
    final isDark = theme.brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      decoration: BoxDecoration(
        color: theme.cardTheme.color ?? theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(AppTheme.cardRadius),
        border: isDark
            ? Border.all(color: theme.dividerTheme.color ?? theme.dividerColor)
            : null,
        boxShadow: isDark ? null : AppTheme.softShadow,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Row(
            children: <Widget>[
              if (icon != null) ...<Widget>[
                Icon(icon, size: 15, color: accent),
                const SizedBox(width: 6),
              ],
              Expanded(
                child: Text(
                  label,
                  style: theme.textTheme.titleSmall,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: <Widget>[
              Flexible(
                child: Text(
                  value,
                  // Вебийн `display` — 34/700. Гар утсан дээр 30.
                  style: theme.textTheme.headlineSmall?.copyWith(
                    fontSize: 30,
                    fontWeight: FontWeight.w800,
                    height: 1.15,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              if (unit != null) ...<Widget>[
                const SizedBox(width: 4),
                Text(
                  unit!,
                  style: theme.textTheme.bodySmall?.copyWith(fontSize: 12),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }
}

/// Дүрсний бөмбөлөг — HeartFit-ийн хавтан, жагсаалтын дүрс: өнгөний 12%
/// дэвсгэртэй дугуй дотор бүтэн өнгөтэй дүрс.
class IconBubble extends StatelessWidget {
  const IconBubble({
    super.key,
    required this.icon,
    required this.color,
    this.size = 36,
  });

  final IconData icon;
  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        shape: BoxShape.circle,
      ),
      alignment: Alignment.center,
      child: Icon(icon, size: size * 0.54, color: color),
    );
  }
}

/// Градиент том карт — HeartFit нүүрний "Last Measurement" хавтан.
///
/// Дээрх бичвэр нь цагаан; градиент нь [AppColors.brandGradient] тул том
/// (18px+) эсвэл тод бичвэрт 3:1-ээс дээш контрасттай.
class GradientHeroCard extends StatelessWidget {
  const GradientHeroCard({
    super.key,
    required this.child,
    this.gradient,
    this.padding = const EdgeInsets.all(18),
    this.onTap,
  });

  final Widget child;
  final Gradient? gradient;
  final EdgeInsets padding;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final radius = BorderRadius.circular(AppTheme.heroRadius);
    return DecoratedBox(
      decoration: BoxDecoration(
        gradient: gradient ?? AppColors.brandGradient,
        borderRadius: radius,
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x40C8126A),
            blurRadius: 22,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: radius,
        clipBehavior: Clip.antiAlias,
        child: InkWell(
          onTap: onTap,
          child: Stack(
            children: <Widget>[
              // Зүрхний цохилтын бүдэг шугам — HeartFit-ийн хавтангийн ард
              // харагддаг ЭКГ долгион. Зөвхөн чимэглэл.
              const Positioned.fill(
                child: IgnorePointer(child: CustomPaint(painter: _PulseLinePainter())),
              ),
              Padding(padding: padding, child: child),
            ],
          ),
        ),
      ),
    );
  }
}

class _PulseLinePainter extends CustomPainter {
  const _PulseLinePainter();

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.13)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..strokeJoin = StrokeJoin.round;
    final y = size.height * 0.58;
    final w = size.width;
    final path = Path()
      ..moveTo(0, y)
      ..lineTo(w * 0.42, y)
      ..lineTo(w * 0.47, y - 22)
      ..lineTo(w * 0.52, y + 26)
      ..lineTo(w * 0.57, y - 44)
      ..lineTo(w * 0.62, y + 12)
      ..lineTo(w * 0.66, y)
      ..lineTo(w, y);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant _PulseLinePainter oldDelegate) => false;
}
