import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/submission_model.dart';
import '../../providers/submissions_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/date_formatter.dart';
import '../../widgets/app_button.dart';
import '../../widgets/custom_toast.dart';
import '../../widgets/status_badge.dart';

class SubmissionDetailSheet extends StatefulWidget {
  final Submission submission;

  const SubmissionDetailSheet({super.key, required this.submission});

  static Future<void> show(BuildContext context, Submission submission) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => SubmissionDetailSheet(submission: submission),
    );
  }

  @override
  State<SubmissionDetailSheet> createState() => _SubmissionDetailSheetState();
}

class _SubmissionDetailSheetState extends State<SubmissionDetailSheet> {
  late bool _isRead;
  bool _isToggling = false;

  @override
  void initState() {
    super.initState();
    _isRead = widget.submission.read;
    // If opening an unread submission, automatically mark it as read!
    if (!_isRead) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _toggleRead(true);
      });
    }
  }

  Future<void> _toggleRead(bool read) async {
    setState(() => _isToggling = true);
    final submissionsProvider = context.read<SubmissionsProvider>();
    final success = await submissionsProvider.markAsRead(widget.submission.id, read: read);
    if (!mounted) return;
    if (success) {
      setState(() => _isRead = read);
    }
    setState(() => _isToggling = false);
  }

  Future<void> _deleteSubmission() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Submission?'),
        content: const Text('Are you sure you want to permanently delete this submission?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Delete', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    final submissionsProvider = context.read<SubmissionsProvider>();
    await submissionsProvider.deleteSubmission(widget.submission.id);

    if (!mounted) return;
    Navigator.of(context).pop();
    CustomToast.showSuccess(context, 'Submission deleted');
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.vertical(top: Radius.circular(22)),
      ),
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).padding.bottom + 20,
      ),
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          // Drag handle
          Center(
            child: Container(
              width: 38,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Header
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        if (widget.submission.projectName != null)
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            margin: const EdgeInsets.only(right: 8),
                            decoration: BoxDecoration(
                              color: AppColors.primaryForest.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              widget.submission.projectName!,
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryForest,
                              ),
                            ),
                          ),
                        _isRead ? StatusBadge.read() : StatusBadge.unread(),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      widget.submission.displayName,
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                        letterSpacing: -0.3,
                      ),
                    ),
                    if (widget.submission.displayEmail != null) ...[
                      const SizedBox(height: 2),
                      Text(
                        widget.submission.displayEmail!,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, size: 20),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),

          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.access_time_rounded, size: 14, color: AppColors.textMuted),
              const SizedBox(width: 4),
              Text(
                DateFormatter.formatFull(widget.submission.createdAt),
                style: const TextStyle(fontSize: 12, color: AppColors.textMuted),
              ),
            ],
          ),

          const Divider(height: 24),

          // Form Submission Fields
          const Text(
            'Submitted Data',
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w700,
              color: AppColors.textSecondary,
            ),
          ),
          const SizedBox(height: 10),

          Expanded(
            child: ListView(
              children: widget.submission.data.entries.map((entry) {
                final key = entry.key;
                final val = entry.value?.toString() ?? '';
                final isLong = val.length > 50 || val.contains('\n');

                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.bgSecondary,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            key.replaceAll('_', ' ').toUpperCase(),
                            style: const TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryForest,
                              letterSpacing: 0.5,
                            ),
                          ),
                          InkWell(
                            onTap: () => CustomToast.copyToClipboard(context, val, key),
                            borderRadius: BorderRadius.circular(4),
                            child: const Padding(
                              padding: EdgeInsets.all(4),
                              child: Icon(Icons.copy_rounded, size: 14, color: AppColors.textMuted),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 6),
                      SelectableText(
                        val.isEmpty ? '(empty)' : val,
                        style: TextStyle(
                          fontSize: isLong ? 13 : 14,
                          fontWeight: FontWeight.w500,
                          color: val.isEmpty ? AppColors.textMuted : AppColors.textPrimary,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),

          const Divider(height: 24),

          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _isToggling ? null : () => _toggleRead(!_isRead),
                  icon: Icon(
                    _isRead ? Icons.mark_email_unread_outlined : Icons.drafts_outlined,
                    size: 16,
                  ),
                  label: Text(_isRead ? 'Mark Unread' : 'Mark Read', style: const TextStyle(fontSize: 12)),
                ),
              ),
              const SizedBox(width: 10),
              AppButton(
                text: 'Delete',
                icon: Icons.delete_outline_rounded,
                variant: AppButtonVariant.danger,
                height: 42,
                onPressed: _deleteSubmission,
              ),
            ],
          ),
        ],
      ),
    );
  }
}
