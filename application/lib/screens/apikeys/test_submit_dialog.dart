import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/project_model.dart';
import '../../providers/submissions_provider.dart';
import '../../services/api_service.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/custom_toast.dart';

class TestSubmitDialog extends StatefulWidget {
  final Project project;

  const TestSubmitDialog({super.key, required this.project});

  static Future<void> show(BuildContext context, Project project) {
    return showDialog(
      context: context,
      builder: (context) => TestSubmitDialog(project: project),
    );
  }

  @override
  State<TestSubmitDialog> createState() => _TestSubmitDialogState();
}

class _TestSubmitDialogState extends State<TestSubmitDialog> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, TextEditingController> _controllers = {};
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();
    for (final field in widget.project.fields) {
      String defaultVal = '';
      if (field.name == 'name') defaultVal = 'Mobile Test User';
      if (field.name == 'email') defaultVal = 'test@formconnect.dev';
      if (field.name == 'message') defaultVal = 'Testing mobile dashboard submission!';
      _controllers[field.name] = TextEditingController(text: defaultVal);
    }
  }

  @override
  void dispose() {
    for (final c in _controllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);
    final data = <String, dynamic>{};
    for (final entry in _controllers.entries) {
      data[entry.key] = entry.value.text.trim();
    }

    try {
      final submissionId = await ApiService.submitForm(
        apiKey: widget.project.apiKey,
        data: data,
      );

      if (!mounted) return;
      // Refresh inbox
      context.read<SubmissionsProvider>().fetchSubmissions();

      Navigator.of(context).pop();
      CustomToast.showSuccess(context, 'Test form submitted! (ID: ${submissionId.substring(0, 8)}...)');
    } catch (e) {
      if (!mounted) return;
      setState(() => _isSubmitting = false);
      CustomToast.showError(context, e.toString());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      backgroundColor: AppColors.bgCard,
      surfaceTintColor: Colors.transparent,
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 480, maxHeight: 580),
        child: Padding(
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
                    child: const Icon(Icons.send_rounded, color: AppColors.primaryForest, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Test Form Submission',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w700,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        Text(
                          'Send live test data to ${widget.project.name}',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
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
              const SizedBox(height: 16),

              Expanded(
                child: Form(
                  key: _formKey,
                  child: ListView.separated(
                    itemCount: widget.project.fields.length,
                    separatorBuilder: (context, index) => const SizedBox(height: 12),
                    itemBuilder: (context, index) {
                      final field = widget.project.fields[index];
                      final ctrl = _controllers[field.name];

                      return AppTextField(
                        controller: ctrl,
                        label: '${field.name[0].toUpperCase()}${field.name.substring(1)}${field.required ? ' *' : ''}',
                        hint: 'Enter ${field.name}',
                        maxLines: field.type == 'textarea' ? 3 : 1,
                        keyboardType: field.type == 'email'
                            ? TextInputType.emailAddress
                            : field.type == 'number'
                                ? TextInputType.number
                                : TextInputType.text,
                        validator: (val) {
                          if (field.required && (val == null || val.trim().isEmpty)) {
                            return '${field.name} is required';
                          }
                          return null;
                        },
                      );
                    },
                  ),
                ),
              ),

              const SizedBox(height: 18),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Navigator.of(context).pop(),
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: 8),
                  AppButton(
                    text: 'Send Test Submission',
                    isLoading: _isSubmitting,
                    onPressed: _handleSubmit,
                    height: 42,
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
