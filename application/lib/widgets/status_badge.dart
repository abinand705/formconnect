import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final Color backgroundColor;
  final Color textColor;
  final IconData? icon;
  final double fontSize;
  final EdgeInsetsGeometry padding;

  const StatusBadge({
    super.key,
    required this.label,
    required this.backgroundColor,
    required this.textColor,
    this.icon,
    this.fontSize = 11,
    this.padding = const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
  });

  factory StatusBadge.unread() {
    return const StatusBadge(
      label: 'Unread',
      backgroundColor: AppColors.accentMintLight,
      textColor: AppColors.accentMintDark,
      icon: Icons.mark_email_unread_rounded,
    );
  }

  factory StatusBadge.read() {
    return const StatusBadge(
      label: 'Read',
      backgroundColor: AppColors.bgSecondary,
      textColor: AppColors.textSecondary,
      icon: Icons.drafts_outlined,
    );
  }

  factory StatusBadge.success(String text) {
    return StatusBadge(
      label: text,
      backgroundColor: AppColors.successBg,
      textColor: AppColors.success,
      icon: Icons.check_circle_outline,
    );
  }

  factory StatusBadge.count(int count) {
    return StatusBadge(
      label: '$count ${count == 1 ? 'submission' : 'submissions'}',
      backgroundColor: AppColors.bgSecondary,
      textColor: AppColors.textSecondary,
      icon: Icons.all_inbox_rounded,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: textColor.withValues(alpha: 0.15),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: fontSize + 2, color: textColor),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      ),
    );
  }
}
