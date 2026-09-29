import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/submission_model.dart';
import '../../providers/projects_provider.dart';
import '../../providers/submissions_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/date_formatter.dart';
import '../../widgets/custom_toast.dart';
import '../../widgets/empty_state.dart';
import 'submission_detail_sheet.dart';

class SubmissionsScreen extends StatefulWidget {
  const SubmissionsScreen({super.key});

  @override
  State<SubmissionsScreen> createState() => _SubmissionsScreenState();
}

class _SubmissionsScreenState extends State<SubmissionsScreen> {
  final _searchController = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<SubmissionsProvider>().fetchSubmissions();
    });
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _handleMarkAllRead() async {
    final subProv = context.read<SubmissionsProvider>();
    final count = subProv.unreadCount;
    if (count == 0) {
      CustomToast.showInfo(context, 'All submissions are already marked as read');
      return;
    }

    final success = await subProv.markAllAsRead(projectId: subProv.selectedProjectId);
    if (!mounted) return;

    if (success) {
      CustomToast.showSuccess(context, 'Marked all as read');
    }
  }

  @override
  Widget build(BuildContext context) {
    final submissionsProvider = context.watch<SubmissionsProvider>();
    final projectsProvider = context.watch<ProjectsProvider>();
    final projects = projectsProvider.projects;

    final filteredSubmissions = submissionsProvider.filteredSubmissions;
    final unreadCount = submissionsProvider.unreadCount;

    return Scaffold(
      backgroundColor: AppColors.bgPage,
      body: RefreshIndicator(
        color: AppColors.primaryForest,
        onRefresh: () => submissionsProvider.fetchSubmissions(),
        child: Column(
          children: [
            // Filter & Search Controls Header
            Container(
              color: AppColors.bgCard,
              padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
              child: Column(
                children: [
                  // Search Bar
                  TextField(
                    controller: _searchController,
                    onChanged: (val) => submissionsProvider.setSearchQuery(val),
                    style: const TextStyle(fontSize: 13),
                    decoration: InputDecoration(
                      hintText: 'Search messages, sender, email...',
                      prefixIcon: const Icon(Icons.search_rounded, size: 20),
                      suffixIcon: submissionsProvider.searchQuery.isNotEmpty
                          ? IconButton(
                              icon: const Icon(Icons.clear, size: 16),
                              onPressed: () {
                                _searchController.clear();
                                submissionsProvider.setSearchQuery('');
                              },
                            )
                          : null,
                      contentPadding: const EdgeInsets.symmetric(vertical: 10, horizontal: 14),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // Filter Row (Status Pills & Project Dropdown)
                  Row(
                    children: [
                      // Status Segmented Controls
                      _buildFilterChip('all', 'All', submissionsProvider.statusFilter, (f) {
                        submissionsProvider.setStatusFilter(f);
                      }),
                      const SizedBox(width: 6),
                      _buildFilterChip(
                        'unread',
                        'Unread ($unreadCount)',
                        submissionsProvider.statusFilter,
                        (f) => submissionsProvider.setStatusFilter(f),
                        highlightColor: AppColors.accentMint,
                      ),
                      const SizedBox(width: 6),
                      _buildFilterChip('read', 'Read', submissionsProvider.statusFilter, (f) {
                        submissionsProvider.setStatusFilter(f);
                      }),

                      const Spacer(),

                      // Mark All as Read Button
                      if (unreadCount > 0)
                        IconButton(
                          tooltip: 'Mark all as read',
                          icon: const Icon(Icons.done_all_rounded, size: 20, color: AppColors.primaryForest),
                          onPressed: _handleMarkAllRead,
                        ),
                    ],
                  ),

                  // Project selector if more than 1 project exists
                  if (projects.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Row(
                      children: [
                        const Icon(Icons.filter_list_rounded, size: 16, color: AppColors.textSecondary),
                        const SizedBox(width: 6),
                        const Text(
                          'Project: ',
                          style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                        ),
                        Expanded(
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String?>(
                              value: submissionsProvider.selectedProjectId,
                              isDense: true,
                              style: const TextStyle(
                                fontSize: 12,
                                fontWeight: FontWeight.w700,
                                color: AppColors.primaryForest,
                              ),
                              items: [
                                const DropdownMenuItem<String?>(
                                  value: null,
                                  child: Text('All Projects'),
                                ),
                                ...projects.map((p) => DropdownMenuItem<String?>(
                                      value: p.id,
                                      child: Text(
                                        p.name,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    )),
                              ],
                              onChanged: (val) {
                                submissionsProvider.setSelectedProjectId(val);
                              },
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const Divider(height: 1),

            // Submissions List
            Expanded(
              child: submissionsProvider.isLoading && submissionsProvider.submissions.isEmpty
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primaryForest))
                  : filteredSubmissions.isEmpty
                      ? EmptyState(
                          icon: Icons.mark_email_read_rounded,
                          title: submissionsProvider.searchQuery.isNotEmpty
                              ? 'No matching submissions'
                              : submissionsProvider.statusFilter == 'unread'
                                  ? 'All caught up!'
                                  : 'No submissions yet',
                          description: submissionsProvider.searchQuery.isNotEmpty
                              ? 'Try searching with a different keyword.'
                              : 'Submissions sent to your form endpoints will appear here in real time.',
                        )
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          itemCount: filteredSubmissions.length,
                          separatorBuilder: (context, index) => const SizedBox(height: 8),
                          itemBuilder: (context, index) {
                            final submission = filteredSubmissions[index];
                            return _buildSubmissionCard(context, submission);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFilterChip(
    String id,
    String label,
    String current,
    void Function(String) onSelect, {
    Color? highlightColor,
  }) {
    final isSelected = current == id;
    return InkWell(
      onTap: () => onSelect(id),
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: isSelected
              ? (highlightColor != null ? AppColors.accentMintLight : AppColors.primaryForest)
              : AppColors.bgSecondary,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected
                ? (highlightColor ?? AppColors.primaryForest)
                : AppColors.border,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w600,
            color: isSelected
                ? (highlightColor != null ? AppColors.accentMintDark : Colors.white)
                : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildSubmissionCard(BuildContext context, Submission sub) {
    return Dismissible(
      key: Key(sub.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: AppColors.danger,
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.delete_outline_rounded, color: Colors.white, size: 24),
      ),
      confirmDismiss: (_) async {
        return await showDialog<bool>(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Delete Submission?'),
            content: const Text('This will delete this submission message.'),
            actions: [
              TextButton(onPressed: () => Navigator.of(ctx).pop(false), child: const Text('Cancel')),
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.danger),
                onPressed: () => Navigator.of(ctx).pop(true),
                child: const Text('Delete', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        );
      },
      onDismissed: (_) {
        context.read<SubmissionsProvider>().deleteSubmission(sub.id);
        CustomToast.showSuccess(context, 'Submission removed');
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: sub.read ? AppColors.border : AppColors.accentMint.withValues(alpha: 0.5),
            width: sub.read ? 1 : 1.5,
          ),
          boxShadow: [
            BoxShadow(
              color: sub.read ? const Color(0x04000000) : const Color(0x1022C55E),
              blurRadius: 6,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Material(
          color: Colors.transparent,
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => SubmissionDetailSheet.show(context, sub),
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Top row: Project badge, Unread Dot, Timestamp
                  Row(
                    children: [
                      if (sub.projectName != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.primaryForest.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text(
                            sub.projectName!,
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                              color: AppColors.primaryForest,
                            ),
                          ),
                        ),
                      const SizedBox(width: 8),
                      if (!sub.read)
                        Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.accentMint,
                            shape: BoxShape.circle,
                          ),
                        ),
                      const Spacer(),
                      Text(
                        DateFormatter.getRelativeTime(sub.createdAt),
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),

                  // Sender Name & Email
                  Row(
                    children: [
                      Text(
                        sub.displayName,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: sub.read ? FontWeight.w600 : FontWeight.w800,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      if (sub.displayEmail != null) ...[
                        const SizedBox(width: 6),
                        Text(
                          '•  ${sub.displayEmail!}',
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),

                  // Message Snippet
                  Text(
                    sub.displayMessage,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                      height: 1.35,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
