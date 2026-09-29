import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/project_model.dart';
import '../../providers/projects_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/date_formatter.dart';
import '../../widgets/custom_toast.dart';
import '../../widgets/empty_state.dart';
import '../apikeys/test_submit_dialog.dart';
import 'code_snippet_dialog.dart';
import 'create_project_dialog.dart';
import 'edit_fields_sheet.dart';
import 'email_fields_dialog.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({super.key});

  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  final _searchController = TextEditingController();
  String _searchQuery = '';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProjectsProvider>().fetchProjects();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _handleDeleteProject(Project project) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text('Delete "${project.name}"?'),
        content: const Text(
          'This will permanently delete the project and all of its associated submissions. This action cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Delete Permanently', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    final success = await context.read<ProjectsProvider>().deleteProject(project.id);
    if (!mounted) return;

    if (success) {
      CustomToast.showSuccess(context, 'Project deleted');
    } else {
      CustomToast.showError(context, 'Failed to delete project');
    }
  }

  Future<void> _handleRegenerateKey(Project project) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Regenerate API Key?'),
        content: const Text(
          'Any forms currently using the old API key will stop working immediately until updated with the new key.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryForest),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Regenerate', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    final newKey = await context.read<ProjectsProvider>().regenerateApiKey(project.id);
    if (!mounted) return;

    if (newKey != null) {
      CustomToast.showSuccess(context, 'New API key generated');
    } else {
      CustomToast.showError(context, 'Failed to regenerate key');
    }
  }

  @override
  Widget build(BuildContext context) {
    final projectsProvider = context.watch<ProjectsProvider>();
    final allProjects = projectsProvider.projects;

    final filteredProjects = allProjects.where((p) {
      if (_searchQuery.trim().isEmpty) return true;
      return p.name.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.bgPage,
      body: RefreshIndicator(
        color: AppColors.primaryForest,
        onRefresh: () => projectsProvider.fetchProjects(),
        child: Column(
          children: [
            // Search & Filter header
            Container(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 12),
              color: AppColors.bgCard,
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _searchController,
                      onChanged: (val) => setState(() => _searchQuery = val),
                      style: const TextStyle(fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Search projects...',
                        prefixIcon: const Icon(Icons.search_rounded, size: 20),
                        suffixIcon: _searchQuery.isNotEmpty
                            ? IconButton(
                                icon: const Icon(Icons.clear, size: 16),
                                onPressed: () {
                                  _searchController.clear();
                                  setState(() => _searchQuery = '');
                                },
                              )
                            : null,
                        contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  FilledButton.icon(
                    style: FilledButton.styleFrom(
                      backgroundColor: AppColors.primaryForest,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    icon: const Icon(Icons.add, size: 18),
                    label: const Text('New', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                    onPressed: () => CreateProjectDialog.show(context),
                  ),
                ],
              ),
            ),
            const Divider(height: 1),

            // Projects List
            Expanded(
              child: projectsProvider.isLoading && allProjects.isEmpty
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primaryForest))
                  : filteredProjects.isEmpty
                      ? EmptyState(
                          icon: Icons.folder_open_rounded,
                          title: _searchQuery.isEmpty ? 'No projects created' : 'No matching projects',
                          description: _searchQuery.isEmpty
                              ? 'Create your first project to generate an API key and start collecting form submissions.'
                              : 'Try a different search query.',
                          buttonText: _searchQuery.isEmpty ? 'Create Project' : null,
                          onButtonPressed: _searchQuery.isEmpty ? () => CreateProjectDialog.show(context) : null,
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: filteredProjects.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 12),
                          itemBuilder: (context, index) {
                            final project = filteredProjects[index];
                            return _buildProjectCard(context, project);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProjectCard(BuildContext context, Project project) {
    final fieldsCount = project.fields.length;
    final maskedKey = project.apiKey.length > 16
        ? '${project.apiKey.substring(0, 10)}••••••••${project.apiKey.substring(project.apiKey.length - 4)}'
        : project.apiKey;

    return Container(
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
        boxShadow: const [
          BoxShadow(
            color: Color(0x06000000),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Card Top Row
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 8, 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.primaryForest.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.dynamic_form_rounded, color: AppColors.primaryForest, size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        project.name,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text(
                            '$fieldsCount ${fieldsCount == 1 ? 'field' : 'fields'}',
                            style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                          ),
                          const Text(' • ', style: TextStyle(color: AppColors.textMuted)),
                          Text(
                            'Created ${DateFormatter.formatDateOnly(project.createdAt)}',
                            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                // Card Popup Menu
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert, size: 20, color: AppColors.textSecondary),
                  onSelected: (val) {
                    switch (val) {
                      case 'fields':
                        EditFieldsSheet.show(context, project);
                        break;
                      case 'email':
                        EmailFieldsDialog.show(context, project);
                        break;
                      case 'snippet':
                        CodeSnippetDialog.show(context, project);
                        break;
                      case 'test':
                        TestSubmitDialog.show(context, project);
                        break;
                      case 'regen':
                        _handleRegenerateKey(project);
                        break;
                      case 'delete':
                        _handleDeleteProject(project);
                        break;
                    }
                  },
                  itemBuilder: (ctx) => [
                    const PopupMenuItem(
                      value: 'fields',
                      child: Row(children: [Icon(Icons.tune_rounded, size: 18), SizedBox(width: 8), Text('Edit Fields Schema')]),
                    ),
                    const PopupMenuItem(
                      value: 'email',
                      child: Row(children: [Icon(Icons.forward_to_inbox_rounded, size: 18), SizedBox(width: 8), Text('Email Settings')]),
                    ),
                    const PopupMenuItem(
                      value: 'snippet',
                      child: Row(children: [Icon(Icons.code_rounded, size: 18), SizedBox(width: 8), Text('View Integration Code')]),
                    ),
                    const PopupMenuItem(
                      value: 'test',
                      child: Row(children: [Icon(Icons.send_rounded, size: 18), SizedBox(width: 8), Text('Test Form Submit')]),
                    ),
                    const PopupMenuDivider(),
                    const PopupMenuItem(
                      value: 'regen',
                      child: Row(children: [Icon(Icons.refresh_rounded, size: 18), SizedBox(width: 8), Text('Regenerate API Key')]),
                    ),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete_outline_rounded, size: 18, color: AppColors.danger),
                          SizedBox(width: 8),
                          Text('Delete Project', style: TextStyle(color: AppColors.danger)),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // API Key Pill Bar
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.bgSecondary,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.border),
              ),
              child: Row(
                children: [
                  const Icon(Icons.key_rounded, size: 14, color: AppColors.textSecondary),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      maskedKey,
                      style: const TextStyle(
                        fontFamily: 'monospace',
                        fontSize: 11,
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  InkWell(
                    onTap: () => CustomToast.copyToClipboard(context, project.apiKey, 'API Key'),
                    borderRadius: BorderRadius.circular(4),
                    child: const Padding(
                      padding: EdgeInsets.all(4),
                      child: Row(
                        children: [
                          Icon(Icons.copy_rounded, size: 14, color: AppColors.primaryForest),
                          SizedBox(width: 4),
                          Text(
                            'Copy',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryForest,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const Divider(height: 12),

          // Action Buttons Footer
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
            child: Row(
              children: [
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    icon: const Icon(Icons.tune_rounded, size: 14),
                    label: const Text('Fields', style: TextStyle(fontSize: 12)),
                    onPressed: () => EditFieldsSheet.show(context, project),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: OutlinedButton.icon(
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    icon: const Icon(Icons.code_rounded, size: 14),
                    label: const Text('Code', style: TextStyle(fontSize: 12)),
                    onPressed: () => CodeSnippetDialog.show(context, project),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: ElevatedButton.icon(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryForest,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      minimumSize: Size.zero,
                      tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    ),
                    icon: const Icon(Icons.send_rounded, size: 14),
                    label: const Text('Test', style: TextStyle(fontSize: 12)),
                    onPressed: () => TestSubmitDialog.show(context, project),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
