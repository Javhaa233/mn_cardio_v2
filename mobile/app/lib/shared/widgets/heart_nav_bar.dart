import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// Доод цэсний нэг товч.
class HeartNavItem {
  const HeartNavItem({
    required this.icon,
    required this.selectedIcon,
    required this.label,
    this.badge = 0,
  });

  final IconData icon;
  final IconData selectedIcon;
  final String label;

  /// Уншаагүй тоо. 0 бол тэмдэг харагдахгүй.
  final int badge;
}

/// HeartFit маягийн доод цэс — цагаан, дээд булан нь бөөрөнхий самбар,
/// голдоо дээш товойсон градиент зүрхэн товчтой.
///
/// [items] нь төв товчны хоёр талд тэнцүү хуваагдана (тэгш тоо байх ёстой).
/// Төв товч нь [onCenterTap]-аар ямар нэг үйлдэл (жишээ нь хэмжилт нэмэх)
/// эсвэл [centerSelected]-ээр таб байж болно.
class HeartNavBar extends StatelessWidget {
  const HeartNavBar({
    super.key,
    required this.items,
    required this.selectedIndex,
    required this.onSelected,
    required this.centerIcon,
    required this.centerLabel,
    required this.onCenterTap,
    this.centerSelected = false,
  }) : assert(items.length % 2 == 0);

  final List<HeartNavItem> items;

  /// [items] доторх сонгогдсон индекс; төв товч сонгогдсон бол -1.
  final int selectedIndex;
  final ValueChanged<int> onSelected;

  final IconData centerIcon;
  final String centerLabel;
  final VoidCallback onCenterTap;
  final bool centerSelected;

  static const double _barHeight = 66;
  static const double _centerSize = 60;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;
    final bottomInset = MediaQuery.paddingOf(context).bottom;
    final half = items.length ~/ 2;

    Widget slot(int i) => Expanded(
          child: _NavButton(
            item: items[i],
            selected: selectedIndex == i,
            onTap: () => onSelected(i),
          ),
        );

    return SizedBox(
      height: _barHeight + bottomInset + 18,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.bottomCenter,
        children: <Widget>[
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              height: _barHeight + bottomInset,
              padding: EdgeInsets.only(bottom: bottomInset),
              decoration: BoxDecoration(
                color: theme.colorScheme.surface,
                borderRadius:
                    const BorderRadius.vertical(top: Radius.circular(26)),
                border: isDark
                    ? Border(top: BorderSide(color: theme.dividerColor))
                    : null,
                boxShadow: isDark
                    ? null
                    : const <BoxShadow>[
                        BoxShadow(
                          color: Color(0x1AB0164F),
                          blurRadius: 20,
                          offset: Offset(0, -4),
                        ),
                      ],
              ),
              child: Row(
                children: <Widget>[
                  for (var i = 0; i < half; i++) slot(i),
                  // Төв товчны доорх шошго.
                  Expanded(
                    child: Align(
                      alignment: Alignment.bottomCenter,
                      child: Padding(
                        padding: const EdgeInsets.only(bottom: 10),
                        child: Text(
                          centerLabel,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: _labelStyle(theme, centerSelected),
                        ),
                      ),
                    ),
                  ),
                  for (var i = half; i < items.length; i++) slot(i),
                ],
              ),
            ),
          ),
          Positioned(
            bottom: bottomInset + _barHeight - _centerSize * 0.62,
            child: Semantics(
              button: true,
              selected: centerSelected,
              label: centerLabel,
              child: _CenterButton(
                icon: centerIcon,
                size: _centerSize,
                selected: centerSelected,
                onTap: onCenterTap,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

TextStyle _labelStyle(ThemeData theme, bool selected) => TextStyle(
      fontSize: 11.5,
      height: 1.2,
      fontWeight: selected ? FontWeight.w700 : FontWeight.w500,
      color: selected
          ? theme.colorScheme.primary
          : theme.textTheme.bodySmall?.color ?? AppColors.textSecondary,
    );

class _NavButton extends StatelessWidget {
  const _NavButton({
    required this.item,
    required this.selected,
    required this.onTap,
  });

  final HeartNavItem item;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final color = selected
        ? theme.colorScheme.primary
        : theme.textTheme.bodySmall?.color ?? AppColors.textSecondary;
    final badge = item.badge;

    Widget icon = Icon(
      selected ? item.selectedIcon : item.icon,
      size: 25,
      color: color,
    );
    if (badge > 0) {
      icon = Badge(
        backgroundColor: AppColors.urgent,
        label: Text(badge > 99 ? '99+' : '$badge'),
        child: icon,
      );
    }

    return Semantics(
      button: true,
      selected: selected,
      label: item.label,
      excludeSemantics: true,
      child: InkResponse(
        onTap: onTap,
        radius: 34,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 3),
              decoration: BoxDecoration(
                color: selected
                    ? theme.colorScheme.primaryContainer
                    : Colors.transparent,
                borderRadius: BorderRadius.circular(999),
              ),
              child: icon,
            ),
            const SizedBox(height: 4),
            Text(
              item.label,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: _labelStyle(theme, selected),
            ),
          ],
        ),
      ),
    );
  }
}

class _CenterButton extends StatelessWidget {
  const _CenterButton({
    required this.icon,
    required this.size,
    required this.selected,
    required this.onTap,
  });

  final IconData icon;
  final double size;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final surface = Theme.of(context).colorScheme.surface;
    return Container(
      // Цагаан цагираг — товчийг самбараас "тасалж" харагдуулна.
      padding: const EdgeInsets.all(5),
      decoration: BoxDecoration(color: surface, shape: BoxShape.circle),
      child: DecoratedBox(
        decoration: BoxDecoration(
          gradient: AppColors.navGradient,
          shape: BoxShape.circle,
          border: selected
              ? Border.all(color: Colors.white, width: 2.5)
              : null,
          boxShadow: const <BoxShadow>[
            BoxShadow(
              color: Color(0x59E0306A),
              blurRadius: 16,
              offset: Offset(0, 6),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          shape: const CircleBorder(),
          clipBehavior: Clip.antiAlias,
          child: InkWell(
            onTap: onTap,
            child: SizedBox(
              width: size,
              height: size,
              child: Icon(icon, color: Colors.white, size: size * 0.5),
            ),
          ),
        ),
      ),
    );
  }
}
