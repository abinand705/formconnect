import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/project_model.dart';
import '../../providers/projects_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/custom_toast.dart';
import 'code_snippet_dialog.dart';

class CreateProjectDialog extends StatefulWidget {
  const CreateProjectDialog({super.key});

  static Future<Project?> show(BuildContext context) {
    return showDialog<Project>(
      context: context,
      barrierDismissible: false,
      builder: (context) => const CreateProjectDialog(),
    );
  }

  @override
  State<CreateProjectDialog> createState() => _CreateProjectDialogState();
}

class _CreateProjectDialogState extends State<CreateProjectDialog> {
  int _step = 1;
  final _nameController = TextEditingController();
  final _emailFieldsController = TextEditingController();
  bool _includeAllFields = true;
  Project? _createdProject;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _nameController.dispose();
    _emailFieldsController.dispose();
    super.dispose();
  }

  Future<void> _handleStep1Create() async {
    final name = _nameController.text.trim();
    if (name.isEmpty) return;

    setState(() => _isSubmitting = true);
    final projectsProvider = context.read<ProjectsProvider>();
    final newProj = await projectsProvider.createProject(name);

    if (!mounted) return;
    setState(() => _isSubmitting = false);

    if (newProj != null) {
      setState(() {
        _createdProject = newProj;
        _step = 2;
      });
    } else {
      CustomToast.showError(
        context,
        projectsProvider.errorMessage ?? 'Failed to create project',
      );
    }
  }

  Future<void> _handleStep2EmailFields() async {
    if (_createdProject == null) return;
    setState(() => _isSubmitting = true);

    List<String>? fieldsToInclude;
    if (!_includeAllFields) {
      fieldsToInclude = _emailFieldsController.text
          .split(',')
          .map((s) => s.trim())
          .where((s) => s.isNotEmpty)
          .toList();
    }

    final projectsProvider = context.read<ProjectsProvider>();
    await projectsProvider.updateEmailFields(_createdProject!.id, fieldsToInclude);

    if (!mounted) return;
    setState(() {
      _isSubmitting = false;
      _step = 3;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: AppColors.bgCard,
      surfaceTintColor: Colors.transparent,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primaryForest.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(
                      Icons.folder_open_rounded,
                      color: AppColors.primaryForest,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          _step == 1
                              ? 'Create New Project'
                              : _step == 2
                                  ? 'Email Notifications'
                                  : 'Project Ready!',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          _step == 1
                              ? 'Step 1 of 2: Basic Info'
                              : _step == 2
                                  ? 'Step 2 of 2: Notification setup'
                                  : 'Start collecting form submissions',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: const Icon(Icons.close, size: 20),
                    onPressed: () => Navigator.of(context).pop(_createdProject),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Step 1: Project Name
              if (_step == 1) ...[
                AppTextField(
                  controller: _nameController,
                  label: 'Project Name',
                  hint: 'e.g. Portfolio Contact Form',
                  autofocus: true,
                  prefixIcon: const Icon(Icons.label_outline_rounded, size: 20),
                ),
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
                      text: 'Next: Setup Notifications',
                      isLoading: _isSubmitting,
                      onPressed: _handleStep1Create,
                    ),
                  ],
                ),
              ],

              // Step 2: Email Notification Fields
              if (_step == 2) ...[
                const Text(
                  'Which form fields should be included in notification emails?',
                  style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 14),
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.bgSecondary,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: CheckboxListTile(
                    value: _includeAllFields,
                    activeColor: AppColors.primaryForest,
                    title: const Text(
                      'Include all form fields',
                      style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                    ),
                    subtitle: const Text(
                      'Send all submitted data in the email',
                      style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                    ),
                    onChanged: (val) {
                      setState(() => _includeAllFields = val ?? true);
                    },
                  ),
                ),
                if (!_includeAllFields) ...[
                  const SizedBox(height: 14),
                  AppTextField(
                    controller: _emailFieldsController,
                    label: 'Specific field names (comma-separated)',
                    hint: 'name, email, message',
                  ),
                ],
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    TextButton(
                      onPressed: () => setState(() => _step = 3),
                      child: const Text('Skip'),
                    ),
                    const SizedBox(width: 8),
                    AppButton(
                      text: 'Save & Finish',
                      isLoading: _isSubmitting,
                      onPressed: _handleStep2EmailFields,
                    ),
                  ],
                ),
              ],

              // Step 3: Success Screen with API Key and Embed preview
              if (_step == 3 && _createdProject != null) ...[
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.accentMintLight,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.accentMint.withValues(alpha: 0.3)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.check_circle_rounded, color: AppColors.accentMintDark, size: 28),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              _createdProject!.name,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w700,
                                color: AppColors.accentMintDark,
                              ),
                            ),
                            const Text(
                              'Form endpoint created successfully',
                              style: TextStyle(fontSize: 12, color: AppColors.accentMintDark),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // API Key Box
                const Text(
                  'Your Project API Key:',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.bgSecondary,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          _createdProject!.apiKey,
                          style: const TextStyle(
                            fontFamily: 'monospace',
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.copy_rounded, size: 18),
                        onPressed: () => CustomToast.copyToClipboard(
                          context,
                          _createdProject!.apiKey,
                          'API Key',
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        icon: const Icon(Icons.code_rounded, size: 16),
                        label: const Text('View Snippet'),
                        onPressed: () {
                          Navigator.of(context).pop(_createdProject);
                          CodeSnippetDialog.show(context, _createdProject!);
                        },
                      ),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: AppButton(
                        text: 'Done',
                        onPressed: () => Navigator.of(context).pop(_createdProject),
                      ),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
