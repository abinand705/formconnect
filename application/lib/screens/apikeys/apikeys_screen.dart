import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/project_model.dart';
import '../../providers/projects_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/custom_toast.dart';
import '../../widgets/empty_state.dart';
import '../projects/code_snippet_dialog.dart';
import '../projects/create_project_dialog.dart';
import 'test_submit_dialog.dart';

class ApiKeysScreen extends StatefulWidget {
  const ApiKeysScreen({super.key});

  @override
  State<ApiKeysScreen> createState() => _ApiKeysScreenState();
}

class _ApiKeysScreenState extends State<ApiKeysScreen> {
  final Set<String> _revealedKeys = {};

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<ProjectsProvider>().fetchProjects();
    });
  }

  void _toggleReveal(String projectId) {
    setState(() {
      if (_revealedKeys.contains(projectId)) {
        _revealedKeys.remove(projectId);
      } else {
        _revealedKeys.add(projectId);
      }
    });
  }

  Future<void> _handleRegenerateKey(Project project) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Regenerate API Key?'),
        content: const Text(
          'Existing website contact forms using this API key will stop functioning immediately until you update them with the newly generated key.',
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
    final projects = projectsProvider.projects;

    return Scaffold(
      backgroundColor: AppColors.bgPage,
      body: RefreshIndicator(
        color: AppColors.primaryForest,
        onRefresh: () => projectsProvider.fetchProjects(),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            // Informational Banner
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppColors.primaryForestDark,
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Row(
                children: [
                  Icon(Icons.shield_outlined, color: AppColors.accentMint, size: 24),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Public Submission Keys',
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        SizedBox(height: 2),
                        Text(
                          'Embed these keys in your static frontend forms. They accept submissions without exposing your account password.',
                          style: TextStyle(fontSize: 11, color: Colors.white70, height: 1.35),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Section Title
            const Text(
              'Your API Keys',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 10),

            if (projects.isEmpty && !projectsProvider.isLoading)
              EmptyState(
                icon: Icons.key_off_rounded,
                title: 'No API keys yet',
                description: 'Create a project to generate an API key for your form.',
                buttonText: 'Create Project',
                onButtonPressed: () => CreateProjectDialog.show(context),
              )
            else
              ...projects.map((project) => _buildApiKeyCard(context, project)),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildApiKeyCard(BuildContext context, Project project) {
    final isRevealed = _revealedKeys.contains(project.id);
    final displayKey = isRevealed
        ? project.apiKey
        : '${project.apiKey.substring(0, 8)}••••••••••••••••${project.apiKey.substring(project.apiKey.length - 4)}';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Project Name & Created Info
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                project.name,
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w700,
                  color: AppColors.textPrimary,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.accentMintLight,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text(
                  'ACTIVE',
                  style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.accentMintDark),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // API Key Box
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.bgSecondary,
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                const Icon(Icons.key_rounded, size: 16, color: AppColors.textSecondary),
                const SizedBox(width: 8),
                Expanded(
                  child: SelectableText(
                    displayKey,
                    style: const TextStyle(
                      fontFamily: 'monospace',
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                IconButton(
                  icon: Icon(
                    isRevealed ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                    size: 18,
                    color: AppColors.textSecondary,
                  ),
                  onPressed: () => _toggleReveal(project.id),
                ),
                IconButton(
                  icon: const Icon(Icons.copy_rounded, size: 18, color: AppColors.primaryForest),
                  onPressed: () => CustomToast.copyToClipboard(context, project.apiKey, 'API Key'),
                ),
              ],
            ),
          ),
          const SizedBox(height: 14),

          // Action buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    minimumSize: Size.zero,
                  ),
                  icon: const Icon(Icons.code_rounded, size: 14),
                  label: const Text('Embed Code', style: TextStyle(fontSize: 11)),
                  onPressed: () => CodeSnippetDialog.show(context, project),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: OutlinedButton.icon(
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    minimumSize: Size.zero,
                  ),
                  icon: const Icon(Icons.send_rounded, size: 14),
                  label: const Text('Test Submit', style: TextStyle(fontSize: 11)),
                  onPressed: () => TestSubmitDialog.show(context, project),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(
                tooltip: 'Regenerate API Key',
                icon: const Icon(Icons.refresh_rounded, size: 18, color: AppColors.textSecondary),
                onPressed: () => _handleRegenerateKey(project),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
