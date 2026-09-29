import 'package:flutter/material.dart';
import '../models/analytics_model.dart';
import '../services/api_service.dart';

class AnalyticsProvider extends ChangeNotifier {
  StatsData? _stats;
  AnalyticsData? _analytics;
  bool _isLoading = false;
  String? _errorMessage;

  StatsData? get stats => _stats;
  AnalyticsData? get analytics => _analytics;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  Future<void> fetchDashboardData() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final results = await Future.wait([
        ApiService.getStats().catchError((_) => StatsData(totalProjects: 0, totalSubmissions: 0)),
        ApiService.getAnalytics().catchError((_) => AnalyticsData(dailyCounts: [], byProject: [])),
      ]);

      _stats = results[0] as StatsData;
      _analytics = results[1] as AnalyticsData;
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
}
