import 'package:flutter/material.dart';

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

    // Вебийн карт: гарчиг, түүний доор картын бүтэн өргөнөөр татсан зураас,
    // дараа нь агуулга. Зураас нь картын хажуугийн зайг огтолж гарах ёстой тул
    // гарчиг ба агуулга тус тусдаа Padding-тэй — нэг Padding дотор байвал
    // зураас богиносч, өөр карт мэт харагдана.
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
              padding.top,
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                if (icon != null) ...<Widget>[
                  Icon(icon, size: 20, color: theme.colorScheme.primary),
                  const SizedBox(width: 10),
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
          const Divider(height: 1),
          SizedBox(height: padding.top),
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
    // Вебийн нүүрийн үзүүлэлтүүд нь өнгөт биш, ЦАГААН карт: шошго дээрээ,
    // доор нь том тоо бэхний өнгөөр. Өнгийг зөвхөн дүрсэнд үлдээв — тоог
    // өнгөөр будвал зэрэгцээ таван хайрцаг тус бүр өөр өнгөтэй болж,
    // аль нь эмнэлзүйн хувьд чухал болох нь алдагдана.
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: theme.cardTheme.color ?? theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(AppTheme.cardRadius),
        border: Border.all(
          color: theme.dividerTheme.color ?? theme.dividerColor,
        ),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: AppTheme.shadowInk,
            blurRadius: 2,
            offset: Offset(0, 1),
          ),
        ],
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
                    fontWeight: FontWeight.w700,
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
