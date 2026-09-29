import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/projects_provider.dart';
import '../providers/submissions_provider.dart';
import '../theme/app_theme.dart';
import 'analytics/analytics_screen.dart';
import 'apikeys/apikeys_screen.dart';
import 'dashboard/dashboard_screen.dart';
import 'projects/create_project_dialog.dart';
import 'projects/projects_screen.dart';
import 'settings/server_config_dialog.dart';
import 'settings/settings_screen.dart';
import 'submissions/submissions_screen.dart';

class MainLayoutScreen extends StatefulWidget {
  const MainLayoutScreen({super.key});

  @override
  State<MainLayoutScreen> createState() => _MainLayoutScreenState();
}

class _MainLayoutScreenState extends State<MainLayoutScreen> {
  int _currentIndex = 0;

  void _onTabTapped(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final unreadCount = context.watch<SubmissionsProvider>().unreadCount;
    final projectCount = context.watch<ProjectsProvider>().projectCount;
    final baseUrl = context.watch<AuthProvider>().baseUrl;

    final screens = [
      DashboardScreen(onNavigateToTab: _onTabTapped),
      const ProjectsScreen(),
      const SubmissionsScreen(),
      const AnalyticsScreen(),
      const ApiKeysScreen(),
    ];

    final titles = [
      'Dashboard',
      'Projects',
      'Submissions Inbox',
      'Analytics & Usage',
      'API Keys',
    ];

    return Scaffold(
      backgroundColor: AppColors.bgPage,
      appBar: AppBar(
        titleSpacing: 16,
        title: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: AppColors.primaryForest,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.dynamic_form_rounded,
                color: AppColors.accentMint,
                size: 20,
              ),
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'FormConnect',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -0.3,
                  ),
                ),
                Text(
                  titles[_currentIndex],
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w500,
                    color: AppColors.textSecondary,
                  ),
                ),
              ],
            ),
          ],
        ),
        actions: [
          // Server URL Indicator Pill
          ActionChip(
            avatar: const CircleAvatar(
              radius: 4,
              backgroundColor: AppColors.accentMint,
            ),
            label: Text(
              baseUrl.replaceAll('http://', '').replaceAll('https://', ''),
              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 4),
            materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
            onPressed: () => ServerConfigDialog.show(context),
            backgroundColor: AppColors.bgSecondary,
            side: const BorderSide(color: AppColors.border),
          ),
          const SizedBox(width: 4),
          // Settings button
          IconButton(
            icon: const Icon(Icons.settings_outlined, size: 22),
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const SettingsScreen()),
              );
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: IndexedStack(
        index: _currentIndex,
        children: screens,
      ),
      floatingActionButton: (_currentIndex == 0 || _currentIndex == 1)
          ? FloatingActionButton.extended(
              backgroundColor: AppColors.primaryForest,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.add_rounded, size: 20),
              label: const Text('New Project', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 13)),
              onPressed: () => CreateProjectDialog.show(context),
            )
          : null,
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: _onTabTapped,
        type: BottomNavigationBarType.fixed,
        backgroundColor: AppColors.bgCard,
        selectedItemColor: AppColors.primaryForest,
        unselectedItemColor: AppColors.textMuted,
        items: [
          const BottomNavigationBarItem(
            icon: Icon(Icons.dashboard_outlined),
            activeIcon: Icon(Icons.dashboard_rounded),
            label: 'Dashboard',
          ),
          BottomNavigationBarItem(
            icon: Badge(
              isLabelVisible: projectCount > 0,
              label: Text('$projectCount'),
              backgroundColor: AppColors.primaryForest,
              child: const Icon(Icons.folder_outlined),
            ),
            activeIcon: Badge(
              isLabelVisible: projectCount > 0,
              label: Text('$projectCount'),
              backgroundColor: AppColors.primaryForest,
              child: const Icon(Icons.folder_rounded),
            ),
            label: 'Projects',
          ),
          BottomNavigationBarItem(
            icon: Badge(
              isLabelVisible: unreadCount > 0,
              label: Text('$unreadCount'),
              backgroundColor: AppColors.accentMint,
              child: const Icon(Icons.mark_email_unread_outlined),
            ),
            activeIcon: Badge(
              isLabelVisible: unreadCount > 0,
              label: Text('$unreadCount'),
              backgroundColor: AppColors.accentMint,
              child: const Icon(Icons.mark_email_unread_rounded),
            ),
            label: 'Inbox',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.bar_chart_outlined),
            activeIcon: Icon(Icons.bar_chart_rounded),
            label: 'Analytics',
          ),
          const BottomNavigationBarItem(
            icon: Icon(Icons.key_outlined),
            activeIcon: Icon(Icons.key_rounded),
            label: 'API Keys',
          ),
        ],
      ),
    );
  }
}
