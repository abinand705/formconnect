import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/project_model.dart';
import '../../providers/projects_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/custom_toast.dart';

class EditFieldsSheet extends StatefulWidget {
  final Project project;

  const EditFieldsSheet({super.key, required this.project});

  static Future<void> show(BuildContext context, Project project) {
    return showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => EditFieldsSheet(project: project),
    );
  }

  @override
  State<EditFieldsSheet> createState() => _EditFieldsSheetState();
}

class _EditFieldsSheetState extends State<EditFieldsSheet> {
  late List<ProjectFormField> _fields;
  bool _isSaving = false;

  final _newFieldNameController = TextEditingController();
  String _newFieldType = 'text';
  bool _newFieldRequired = true;

  final List<String> _typeOptions = ['text', 'email', 'textarea', 'number', 'tel'];

  @override
  void initState() {
    super.initState();
    _fields = widget.project.fields.map((f) => f.copyWith()).toList();
  }

  @override
  void dispose() {
    _newFieldNameController.dispose();
    super.dispose();
  }

  void _addNewField() {
    final name = _newFieldNameController.text.trim().toLowerCase().replaceAll(' ', '_');
    if (name.isEmpty) return;

    if (_fields.any((f) => f.name.toLowerCase() == name)) {
      CustomToast.showError(context, 'A field with this name already exists');
      return;
    }

    setState(() {
      _fields.add(ProjectFormField(
        name: name,
        type: _newFieldType,
        required: _newFieldRequired,
      ));
      _newFieldNameController.clear();
      _newFieldType = 'text';
      _newFieldRequired = true;
    });
  }

  Future<void> _saveFields() async {
    if (_fields.isEmpty) {
      CustomToast.showError(context, 'You must have at least one field');
      return;
    }

    setState(() => _isSaving = true);
    final projectsProvider = context.read<ProjectsProvider>();
    final success = await projectsProvider.updateProject(
      widget.project.id,
      fields: _fields,
    );

    if (!mounted) return;
    setState(() => _isSaving = false);

    if (success) {
      CustomToast.showSuccess(context, 'Form schema updated successfully');
      Navigator.of(context).pop();
    } else {
      CustomToast.showError(
        context,
        projectsProvider.errorMessage ?? 'Failed to update fields',
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      padding: EdgeInsets.only(
        top: 20,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.85,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Drag indicator
          Center(
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 14),

          // Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Form Field Schema',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  Text(
                    'Define fields accepted by ${widget.project.name}',
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.close, size: 20),
                onPressed: () => Navigator.of(context).pop(),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Existing Fields List
          Expanded(
            child: ListView.separated(
              itemCount: _fields.length,
              separatorBuilder: (context, index) => const SizedBox(height: 8),
              itemBuilder: (context, index) {
                final field = _fields[index];
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: AppColors.bgSecondary,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: AppColors.primaryForest.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          field.type.toUpperCase(),
                          style: const TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primaryForest,
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              field.name,
                              style: const TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              field.required ? 'Required field' : 'Optional field',
                              style: TextStyle(
                                fontSize: 11,
                                color: field.required ? AppColors.accentMintDark : AppColors.textMuted,
                                fontWeight: field.required ? FontWeight.w600 : FontWeight.w400,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Switch(
                        value: field.required,
                        activeThumbColor: AppColors.primaryForest,
                        onChanged: (val) {
                          setState(() => field.required = val);
                        },
                      ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline_rounded, size: 18, color: AppColors.danger),
                        onPressed: () {
                          setState(() => _fields.removeAt(index));
                        },
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          const Divider(height: 24),

          // Add New Field Row
          const Text(
            'Add New Field',
            style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              Expanded(
                flex: 2,
                child: AppTextField(
                  controller: _newFieldNameController,
                  hint: 'Field name (e.g. phone)',
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                flex: 1,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10),
                  decoration: BoxDecoration(
                    color: AppColors.bgCard,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: DropdownButtonHideUnderline(
                    child: DropdownButton<String>(
                      value: _newFieldType,
                      isExpanded: true,
                      style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
                      items: _typeOptions.map((type) {
                        return DropdownMenuItem(value: type, child: Text(type));
                      }).toList(),
                      onChanged: (val) {
                        if (val != null) setState(() => _newFieldType = val);
                      },
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.primaryForest,
                  foregroundColor: Colors.white,
                ),
                icon: const Icon(Icons.add, size: 20),
                onPressed: _addNewField,
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Bottom Actions
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.of(context).pop(),
                  child: const Text('Cancel'),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: AppButton(
                  text: 'Save Schema',
                  isLoading: _isSaving,
                  onPressed: _saveFields,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
