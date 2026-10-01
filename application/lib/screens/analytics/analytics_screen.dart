import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../models/analytics_model.dart';
import '../../providers/analytics_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/empty_state.dart';

class AnalyticsScreen extends StatefulWidget {
  const AnalyticsScreen({super.key});

  @override
  State<AnalyticsScreen> createState() => _AnalyticsScreenState();
}

class _AnalyticsScreenState extends State<AnalyticsScreen> {
  int _touchedBarIndex = -1;
  int _touchedPieIndex = -1;

  final List<Color> _chartColors = [
    AppColors.primaryForest,
    AppColors.accentMintDark,
    const Color(0xFF0284C7),
    const Color(0xFFD97706),
    const Color(0xFF7C3AED),
    const Color(0xFFDB2777),
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AnalyticsProvider>().fetchDashboardData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final analyticsProv = context.watch<AnalyticsProvider>();
    final stats = analyticsProv.stats;
    final analytics = analyticsProv.analytics;
    final daily = analytics?.dailyCounts ?? [];
    final byProject = analytics?.byProject ?? [];

    final totalPeriod = analytics?.totalInPeriod ?? 0;
    final avgDaily = daily.isNotEmpty ? (totalPeriod / daily.length).toStringAsFixed(1) : '0';

    return Scaffold(
      backgroundColor: AppColors.bgPage,
      body: RefreshIndicator(
        color: AppColors.primaryForest,
        onRefresh: () => analyticsProv.fetchDashboardData(),
        child: analyticsProv.isLoading && analytics == null
            ? const Center(child: CircularProgressIndicator(color: AppColors.primaryForest))
            : ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Key Metrics Cards
                  Row(
                    children: [
                      Expanded(
                        child: _buildMetricCard(
                          title: 'Total All-Time',
                          value: '${stats?.totalSubmissions ?? 0}',
                          subtitle: 'Form submissions',
                          color: AppColors.primaryForest,
                          icon: Icons.all_inbox_rounded,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildMetricCard(
                          title: '30-Day Volume',
                          value: '$totalPeriod',
                          subtitle: 'Last month',
                          color: AppColors.accentMintDark,
                          icon: Icons.trending_up_rounded,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildMetricCard(
                          title: 'Active Projects',
                          value: '${stats?.totalProjects ?? 0}',
                          subtitle: 'Connected forms',
                          color: AppColors.info,
                          icon: Icons.folder_copy_rounded,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildMetricCard(
                          title: 'Avg. Daily Rate',
                          value: avgDaily,
                          subtitle: 'Submissions / day',
                          color: AppColors.warning,
                          icon: Icons.speed_rounded,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 22),

                  // 30-Day Submissions Trend Chart
                  _build30DayChartCard(daily),
                  const SizedBox(height: 22),

                  // Submissions by Project
                  _buildProjectDistributionCard(byProject),
                  const SizedBox(height: 30),
                ],
              ),
      ),
    );
  }

  Widget _buildMetricCard({
    required String title,
    required String value,
    required String subtitle,
    required Color color,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
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
              Text(
                title,
                style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
              ),
              Icon(icon, size: 18, color: color),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: AppColors.textPrimary,
              letterSpacing: -0.5,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
          ),
        ],
      ),
    );
  }

  Widget _build30DayChartCard(List<DailyCount> daily) {
    final maxVal = daily.fold(0, (max, d) => d.count > max ? d.count : max);

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
                    '30-Day Submissions Trend',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                  ),
                  Text(
                    'Daily breakdown across all active endpoints',
                    style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppColors.bgSecondary,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text('30 Days', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600)),
              ),
            ],
          ),
          const SizedBox(height: 24),
          if (daily.isEmpty)
            const SizedBox(
              height: 160,
              child: Center(
                child: Text('No submissions recorded yet', style: TextStyle(color: AppColors.textMuted)),
              ),
            )
          else
            SizedBox(
              height: 180,
              child: BarChart(
                BarChartData(
                  alignment: BarChartAlignment.spaceAround,
                  maxY: (maxVal < 4 ? 4 : maxVal).toDouble() + 1,
                  barTouchData: BarTouchData(
                    touchCallback: (event, response) {
                      setState(() {
                        if (response?.spot != null && event is! FlTapUpEvent && event is! FlPanEndEvent) {
                          _touchedBarIndex = response!.spot!.touchedBarGroupIndex;
                        } else {
                          _touchedBarIndex = -1;
                        }
                      });
                    },
                    touchTooltipData: BarTouchTooltipData(
                      getTooltipItem: (group, groupIndex, rod, rodIndex) {
                        final item = daily[groupIndex];
                        return BarTooltipItem(
                          '${item.date}\n${rod.toY.toInt()} Submissions',
                          const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                        );
                      },
                    ),
                  ),
                  titlesData: FlTitlesData(
                    show: true,
                    topTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    rightTitles: const AxisTitles(
                      sideTitles: SideTitles(showTitles: false),
                    ),
                    leftTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 24,
                        getTitlesWidget: (value, meta) {
                          if (value == value.toInt() && value % 2 == 0) {
                            return Text(
                              '${value.toInt()}',
                              style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                            );
                          }
                          return const SizedBox.shrink();
                        },
                      ),
                    ),
                    bottomTitles: AxisTitles(
                      sideTitles: SideTitles(
                        showTitles: true,
                        reservedSize: 22,
                        getTitlesWidget: (value, meta) {
                          final idx = value.toInt();
                          if (idx % 6 == 0 && idx < daily.length) {
                            final rawDate = daily[idx].date;
                            final parts = rawDate.split('-');
                            final label = parts.length >= 3 ? '${parts[1]}/${parts[2]}' : rawDate;
                            return Padding(
                              padding: const EdgeInsets.only(top: 4),
                              child: Text(
                                label,
                                style: const TextStyle(fontSize: 9, color: AppColors.textMuted),
                              ),
                            );
                          }
                          return const SizedBox.shrink();
                        },
                      ),
                    ),
                  ),
                  gridData: const FlGridData(
                    show: true,
                    drawVerticalLine: false,
                    horizontalInterval: 1,
                  ),
                  borderData: FlBorderData(show: false),
                  barGroups: daily.asMap().entries.map((entry) {
                    final idx = entry.key;
                    final item = entry.value;
                    final isTouched = idx == _touchedBarIndex;
                    return BarChartGroupData(
                      x: idx,
                      barRods: [
                        BarChartRodData(
                          toY: item.count.toDouble(),
                          color: isTouched
                              ? AppColors.accentMintDark
                              : item.count > 0
                                  ? AppColors.primaryForest
                                  : AppColors.border,
                          width: 6,
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(3)),
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

  Widget _buildProjectDistributionCard(List<ProjectAnalytics> byProject) {
    final total = byProject.fold<int>(0, (sum, p) => sum + p.count);

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
          const Text(
            'Submissions by Project',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
          ),
          const Text(
            'Distribution of volume across your endpoints',
            style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
          ),
          const SizedBox(height: 20),

          if (byProject.isEmpty)
            const EmptyState(
              icon: Icons.pie_chart_outline_rounded,
              title: 'No project data',
              description: 'Create forms to see submission share per project.',
            )
          else ...[
            // Donut / Pie Chart if total > 0
            if (total > 0) ...[
              SizedBox(
                height: 180,
                child: PieChart(
                  PieChartData(
                    pieTouchData: PieTouchData(
                      touchCallback: (event, response) {
                        setState(() {
                          if (response?.touchedSection != null &&
                              event is! FlTapUpEvent &&
                              event is! FlPanEndEvent) {
                            _touchedPieIndex = response!.touchedSection!.touchedSectionIndex;
                          } else {
                            _touchedPieIndex = -1;
                          }
                        });
                      },
                    ),
                    sectionsSpace: 3,
                    centerSpaceRadius: 40,
                    sections: byProject.asMap().entries.map((entry) {
                      final idx = entry.key;
                      final p = entry.value;
                      final isTouched = idx == _touchedPieIndex;
                      final color = _chartColors[idx % _chartColors.length];
                      final pct = total > 0 ? (p.count / total * 100).toStringAsFixed(0) : '0';

                      return PieChartSectionData(
                        value: p.count.toDouble(),
                        color: color,
                        title: '$pct%',
                        radius: isTouched ? 45 : 38,
                        titleStyle: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Project Breakdown List
            ...byProject.asMap().entries.map((entry) {
              final idx = entry.key;
              final p = entry.value;
              final color = _chartColors[idx % _chartColors.length];
              final pct = total > 0 ? (p.count / total * 100).toStringAsFixed(1) : '0.0';

              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.bgSecondary,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: Row(
                  children: [
                    CircleAvatar(radius: 5, backgroundColor: color),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        p.projectName,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppColors.textPrimary),
                      ),
                    ),
                    Text(
                      '${p.count} ($pct%)',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.textPrimary),
                    ),
                  ],
                ),
              );
            }),
          ],
        ],
      ),
    );
  }
}
