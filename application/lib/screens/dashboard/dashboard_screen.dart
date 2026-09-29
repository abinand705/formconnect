import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../models/project_model.dart';
import '../../models/submission_model.dart';
import '../../providers/analytics_provider.dart';
import '../../providers/auth_provider.dart';
import '../../providers/projects_provider.dart';
import '../../providers/submissions_provider.dart';
import '../../theme/app_theme.dart';
import '../../utils/date_formatter.dart';
import '../../widgets/empty_state.dart';
import '../apikeys/test_submit_dialog.dart';
import '../projects/create_project_dialog.dart';
import '../submissions/submission_detail_sheet.dart';

class DashboardScreen extends StatefulWidget {
  final void Function(int tabIndex)? onNavigateToTab;

  const DashboardScreen({super.key, this.onNavigateToTab});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadDashboardData();
    });
  }

  Future<void> _loadDashboardData() async {
    await Future.wait([
      context.read<ProjectsProvider>().fetchProjects(),
      context.read<SubmissionsProvider>().fetchSubmissions(),
      context.read<AnalyticsProvider>().fetchDashboardData(),
    ]);
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final projectsProv = context.watch<ProjectsProvider>();
    final submissionsProv = context.watch<SubmissionsProvider>();
    final analyticsProv = context.watch<AnalyticsProvider>();

    final totalProjects = projectsProv.projects.length;
    final totalSubmissions = submissionsProv.submissions.length;
    final unreadCount = submissionsProv.unreadCount;
    final lastSubmission = submissionsProv.submissions.isNotEmpty
        ? submissionsProv.submissions.first.createdAt
        : null;

    final recentSubmissions = submissionsProv.submissions.take(5).toList();

    return Scaffold(
      backgroundColor: AppColors.bgPage,
      body: RefreshIndicator(
        color: AppColors.primaryForest,
        onRefresh: _loadDashboardData,
        child: ListView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
          children: [
            // Welcome Header
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [AppColors.primaryForestDark, AppColors.primaryForest],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x28154234),
                    blurRadius: 18,
                    offset: Offset(0, 6),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.accentMint.withValues(alpha: 0.15),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: AppColors.accentMint.withValues(alpha: 0.3)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            CircleAvatar(radius: 3, backgroundColor: AppColors.accentMint),
                            SizedBox(width: 6),
                            Text(
                              'FormConnect Live',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                color: AppColors.accentMint,
                              ),
                            ),
                          ],
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.refresh_rounded, color: Colors.white70, size: 20),
                        onPressed: _loadDashboardData,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  const Text(
                    'Welcome back 👋',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: -0.4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    user?.email ?? 'Developer Account',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.white.withValues(alpha: 0.8),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Stat Cards Grid (2x2)
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    title: 'Projects',
                    value: '$totalProjects',
                    icon: Icons.folder_rounded,
                    color: AppColors.primaryForest,
                    bgColor: AppColors.primaryForest.withValues(alpha: 0.08),
                    onTap: () => widget.onNavigateToTab?.call(1),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    title: 'Submissions',
                    value: '$totalSubmissions',
                    icon: Icons.all_inbox_rounded,
                    color: AppColors.info,
                    bgColor: AppColors.infoBg,
                    onTap: () => widget.onNavigateToTab?.call(2),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    title: 'Unread',
                    value: '$unreadCount',
                    icon: Icons.mark_email_unread_rounded,
                    color: AppColors.accentMintDark,
                    bgColor: AppColors.accentMintLight,
                    onTap: () => widget.onNavigateToTab?.call(2),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: _buildStatCard(
                    title: 'Last Activity',
                    value: DateFormatter.getRelativeTime(lastSubmission),
                    icon: Icons.access_time_rounded,
                    color: AppColors.warning,
                    bgColor: AppColors.warningBg,
                    isSmallValue: true,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),

            // Quick Actions
            Row(
              children: [
                Expanded(
                  child: _buildQuickActionButton(
                    icon: Icons.add_circle_outline_rounded,
                    label: 'New Project',
                    onTap: () => CreateProjectDialog.show(context),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildQuickActionButton(
                    icon: Icons.send_outlined,
                    label: 'Test Submit',
                    onTap: () {
                      if (projectsProv.projects.isEmpty) {
                        CreateProjectDialog.show(context);
                      } else {
                        _showTestProjectPicker(context, projectsProv.projects);
                      }
                    },
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _buildQuickActionButton(
                    icon: Icons.bar_chart_rounded,
                    label: 'Analytics',
                    onTap: () => widget.onNavigateToTab?.call(3),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Submissions Volume Chart (Mini)
            _buildChartSection(analyticsProv),
            const SizedBox(height: 24),

            // Recent Submissions Section Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recent Submissions',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textPrimary,
                  ),
                ),
                TextButton(
                  onPressed: () => widget.onNavigateToTab?.call(2),
                  child: const Text('View All', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
                ),
              ],
            ),
            const SizedBox(height: 8),

            // Submissions List
            if (recentSubmissions.isEmpty)
              Container(
                padding: const EdgeInsets.symmetric(vertical: 24),
                decoration: BoxDecoration(
                  color: AppColors.bgCard,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.border),
                ),
                child: EmptyState(
                  icon: Icons.inbox_rounded,
                  title: 'No submissions yet',
                  description: 'Create a project and embed the form snippet to receive messages.',
                  buttonText: 'Create Project',
                  onButtonPressed: () => CreateProjectDialog.show(context),
                ),
              )
            else
              ...recentSubmissions.map((sub) => _buildSubmissionTile(context, sub)),

            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required IconData icon,
    required Color color,
    required Color bgColor,
    VoidCallback? onTap,
    bool isSmallValue = false,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.border),
          boxShadow: const [
            BoxShadow(
              color: Color(0x08000000),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(6),
                  decoration: BoxDecoration(color: bgColor, borderRadius: BorderRadius.circular(8)),
                  child: Icon(icon, size: 16, color: color),
                ),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontSize: isSmallValue ? 15 : 22,
                fontWeight: FontWeight.w800,
                color: AppColors.textPrimary,
                letterSpacing: -0.5,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildQuickActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Material(
      color: AppColors.bgCard,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 20, color: AppColors.primaryForest),
              const SizedBox(height: 6),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildChartSection(AnalyticsProvider analyticsProv) {
    final daily = analyticsProv.analytics?.dailyCounts ?? [];
    // Take the last 14 days for a clean mobile dashboard display
    final recentDaily = daily.length > 14 ? daily.sublist(daily.length - 14) : daily;
    final maxVal = recentDaily.fold(0, (max, d) => d.count > max ? d.count : max);

    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Activity Trends',
                    style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                  ),
                  Text(
                    'Submissions over the last 14 days',
                    style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.bgSecondary,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text('14 Days', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 18),
          SizedBox(
            height: 120,
            child: recentDaily.isEmpty
                ? const Center(
                    child: Text('No activity data yet', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                  )
                : BarChart(
                    BarChartData(
                      alignment: BarChartAlignment.spaceAround,
                      maxY: (maxVal < 5 ? 5 : maxVal).toDouble() + 1,
                      barTouchData: BarTouchData(
                        touchTooltipData: BarTouchTooltipData(
                          getTooltipItem: (group, groupIndex, rod, rodIndex) {
                            final item = recentDaily[groupIndex];
                            return BarTooltipItem(
                              '${item.date}\n${rod.toY.toInt()} submissions',
                              const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.w600),
                            );
                          },
                        ),
                      ),
                      titlesData: const FlTitlesData(show: false),
                      gridData: const FlGridData(show: false),
                      borderData: FlBorderData(show: false),
                      barGroups: recentDaily.asMap().entries.map((entry) {
                        final idx = entry.key;
                        final item = entry.value;
                        return BarChartGroupData(
                          x: idx,
                          barRods: [
                            BarChartRodData(
                              toY: item.count.toDouble(),
                              color: item.count > 0 ? AppColors.primaryForest : AppColors.border,
                              width: 10,
                              borderRadius: const BorderRadius.vertical(top: Radius.circular(4)),
                            ),
                          ],
                        );
                      }).toList(),
                    ),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildSubmissionTile(BuildContext context, Submission sub) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(
        color: AppColors.bgCard,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        onTap: () => SubmissionDetailSheet.show(context, sub),
        leading: CircleAvatar(
          backgroundColor: sub.read ? AppColors.bgSecondary : AppColors.accentMintLight,
          radius: 20,
          child: Icon(
            sub.read ? Icons.drafts_outlined : Icons.mark_email_unread_rounded,
            size: 18,
            color: sub.read ? AppColors.textSecondary : AppColors.accentMintDark,
          ),
        ),
        title: Row(
          children: [
            Expanded(
              child: Text(
                sub.displayName,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: sub.read ? FontWeight.w600 : FontWeight.w800,
                  color: AppColors.textPrimary,
                ),
              ),
            ),
            Text(
              DateFormatter.getRelativeTime(sub.createdAt),
              style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
            ),
          ],
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 2),
            Text(
              sub.displayMessage,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
            ),
            if (sub.projectName != null) ...[
              const SizedBox(height: 4),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                    decoration: BoxDecoration(
                      color: AppColors.bgSecondary,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      sub.projectName!,
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: AppColors.primaryForest),
                    ),
                  ),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }

  void _showTestProjectPicker(BuildContext context, List<Project> projects) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        decoration: const BoxDecoration(
          color: AppColors.bgCard,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Select Project to Test',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 12),
            ...projects.map((p) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: const Icon(Icons.folder_outlined, color: AppColors.primaryForest),
                  title: Text(p.name, style: const TextStyle(fontWeight: FontWeight.w600)),
                  subtitle: Text('${p.fields.length} fields defined'),
                  trailing: const Icon(Icons.chevron_right, size: 20),
                  onTap: () {
                    Navigator.of(ctx).pop();
                    TestSubmitDialog.show(context, p);
                  },
                )),
          ],
        ),
      ),
    );
  }
}
