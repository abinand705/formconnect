import '../utils/date_formatter.dart';

class DailyCount {
  final String date;
  final int count;

  DailyCount({required this.date, required this.count});

  factory DailyCount.fromJson(Map<String, dynamic> json) {
    return DailyCount(
      date: json['date']?.toString() ?? '',
      count: int.tryParse(json['count']?.toString() ?? '0') ?? 0,
    );
  }
}

class ProjectAnalytics {
  final String projectId;
  final String projectName;
  final int count;

  ProjectAnalytics({
    required this.projectId,
    required this.projectName,
    required this.count,
  });

  factory ProjectAnalytics.fromJson(Map<String, dynamic> json) {
    return ProjectAnalytics(
      projectId: json['projectId']?.toString() ?? '',
      projectName: json['projectName']?.toString() ?? 'Untitled Project',
      count: int.tryParse(json['count']?.toString() ?? '0') ?? 0,
    );
  }
}

class AnalyticsData {
  final List<DailyCount> dailyCounts;
  final List<ProjectAnalytics> byProject;

  AnalyticsData({required this.dailyCounts, required this.byProject});

  factory AnalyticsData.fromJson(Map<String, dynamic> json) {
    List<DailyCount> daily = [];
    if (json['dailyCounts'] != null && json['dailyCounts'] is List) {
      daily = (json['dailyCounts'] as List)
          .whereType<Map<String, dynamic>>()
          .map((d) => DailyCount.fromJson(d))
          .toList();
    }

    List<ProjectAnalytics> projects = [];
    if (json['byProject'] != null && json['byProject'] is List) {
      projects = (json['byProject'] as List)
          .whereType<Map<String, dynamic>>()
          .map((p) => ProjectAnalytics.fromJson(p))
          .toList();
    }

    return AnalyticsData(dailyCounts: daily, byProject: projects);
  }

  int get totalInPeriod {
    return dailyCounts.fold(0, (sum, item) => sum + item.count);
  }
}

class StatsData {
  final int totalProjects;
  final int totalSubmissions;
  final DateTime? lastActivity;

  StatsData({
    required this.totalProjects,
    required this.totalSubmissions,
    this.lastActivity,
  });

  factory StatsData.fromJson(Map<String, dynamic> json) {
    return StatsData(
      totalProjects: int.tryParse(json['totalProjects']?.toString() ?? '0') ?? 0,
      totalSubmissions: int.tryParse(json['totalSubmissions']?.toString() ?? '0') ?? 0,
      lastActivity: DateFormatter.parseIso(json['lastActivity']),
    );
  }
}
