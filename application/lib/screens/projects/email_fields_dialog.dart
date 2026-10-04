import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/project_model.dart';
import '../../providers/projects_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/custom_toast.dart';

class EmailFieldsDialog extends StatefulWidget {
  final Project project;

  const EmailFieldsDialog({super.key, required this.project});

  static Future<void> show(BuildContext context, Project project) {
    return showDialog(
      context: context,
      builder: (context) => EmailFieldsDialog(project: project),
    );
  }

  @override
  State<EmailFieldsDialog> createState() => _EmailFieldsDialogState();
}

class _EmailFieldsDialogState extends State<EmailFieldsDialog> {
  late bool _includeAll;
  late TextEditingController _fieldsController;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _includeAll = widget.project.emailFields == null || widget.project.emailFields!.isEmpty;
    final initialFields = widget.project.emailFields?.join(', ') ?? '';
    _fieldsController = TextEditingController(text: initialFields);
  }

  @override
  void dispose() {
    _fieldsController.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    setState(() => _isSaving = true);

    List<String>? emailFields;
    if (!_includeAll) {
      emailFields = _fieldsController.text
          .split(',')
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .toList();
    }

    final projects = context.read<ProjectsProvider>();
    final success = await projects.updateEmailFields(widget.project.id, emailFields);

    if (!mounted) return;
    setState(() => _isSaving = false);

    if (success) {
      CustomToast.showSuccess(context, 'Email notification preferences updated');
      Navigator.of(context).pop();
    } else {
      CustomToast.showError(
        context,
        projects.errorMessage ?? 'Failed to update email preferences',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: AppColors.bgCard,
      surfaceTintColor: Colors.transparent,
      clipBehavior: Clip.antiAlias,
      insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 460),
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primaryForest.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.forward_to_inbox_rounded, color: AppColors.primaryForest, size: 20),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Email Notification Fields',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          'Configure which data to receive by email',
                          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              Container(
                decoration: BoxDecoration(
                  color: AppColors.bgSecondary,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: CheckboxListTile(
                  value: _includeAll,
                  activeColor: AppColors.primaryForest,
                  title: const Text(
                    'Include all form fields',
                    style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                  subtitle: const Text(
                    'Forward full submission body to your email',
                    style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  ),
                  onChanged: (val) {
                    setState(() => _includeAll = val ?? true);
                  },
                ),
              ),

              if (!_includeAll) ...[
                const SizedBox(height: 16),
                AppTextField(
                  controller: _fieldsController,
                  label: 'Included Fields (comma-separated)',
                  hint: 'name, email, message',
                ),
              ],

              const SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: 8),
                  AppButton(
                    text: 'Save Preferences',
                    isLoading: _isSaving,
                    onPressed: _handleSave,
                    height: 40,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
