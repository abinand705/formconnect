import 'package:flutter/material.dart';
import '../models/submission_model.dart';
import '../services/api_service.dart';

class SubmissionsProvider extends ChangeNotifier {
  List<Submission> _submissions = [];
  bool _isLoading = false;
  String? _errorMessage;

  String? _selectedProjectId;
  String _statusFilter = 'all'; // 'all', 'unread', 'read'
  String _searchQuery = '';

  List<Submission> get submissions => _submissions;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String? get selectedProjectId => _selectedProjectId;
  String get statusFilter => _statusFilter;
  String get searchQuery => _searchQuery;

  int get unreadCount => _submissions.where((s) => !s.read).length;

  List<Submission> get filteredSubmissions {
    return _submissions.where((s) {
      // Project filter
      if (_selectedProjectId != null && _selectedProjectId!.isNotEmpty) {
        if (s.projectId != _selectedProjectId) return false;
      }

      // Read status filter
      if (_statusFilter == 'unread' && s.read) return false;
      if (_statusFilter == 'read' && !s.read) return false;

      // Search query
      if (_searchQuery.trim().isNotEmpty) {
        final query = _searchQuery.toLowerCase();
        final nameMatch = s.displayName.toLowerCase().contains(query);
        final emailMatch = (s.displayEmail ?? '').toLowerCase().contains(query);
        final messageMatch = s.displayMessage.toLowerCase().contains(query);
        final dataValuesMatch = s.data.values
            .any((v) => v.toString().toLowerCase().contains(query));

        if (!nameMatch && !emailMatch && !messageMatch && !dataValuesMatch) {
          return false;
        }
      }

      return true;
    }).toList();
  }

  void setSelectedProjectId(String? projectId) {
    _selectedProjectId = projectId;
    notifyListeners();
  }

  void setStatusFilter(String filter) {
    _statusFilter = filter;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  Future<void> fetchSubmissions({String? projectId}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _submissions = await ApiService.getSubmissions(projectId: projectId);
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> markAsRead(String id, {bool read = true}) async {
    try {
      final updated = await ApiService.updateSubmissionRead(id, read);
      final index = _submissions.indexWhere((s) => s.id == id);
      if (index != -1) {
        _submissions[index] = updated.copyWith(
          projectName: _submissions[index].projectName,
          projectApiKey: _submissions[index].projectApiKey,
        );
        notifyListeners();
      }
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> markAllAsRead({String? projectId}) async {
    try {
      await ApiService.markAllSubmissionsRead(projectId: projectId);
      for (int i = 0; i < _submissions.length; i++) {
        if (projectId == null || _submissions[i].projectId == projectId) {
          _submissions[i] = _submissions[i].copyWith(read: true);
        }
      }
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<bool> deleteSubmission(String id) async {
    try {
      await ApiService.deleteSubmission(id);
      _submissions.removeWhere((s) => s.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  Future<String?> sendTestSubmission({
    required String apiKey,
    required Map<String, dynamic> data,
  }) async {
    try {
      final id = await ApiService.submitForm(apiKey: apiKey, data: data);
      // Refresh submissions to show the new test submission immediately
      await fetchSubmissions();
      return id;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }
}
