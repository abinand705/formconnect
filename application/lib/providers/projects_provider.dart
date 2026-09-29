import 'package:flutter/material.dart';
import '../models/project_model.dart';
import '../services/api_service.dart';

class ProjectsProvider extends ChangeNotifier {
  List<Project> _projects = [];
  bool _isLoading = false;
  String? _errorMessage;

  List<Project> get projects => _projects;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  int get projectCount => _projects.length;

  Project? getProjectById(String id) {
    try {
      return _projects.firstWhere((p) => p.id == id);
    } catch (_) {
      return null;
    }
  }

  Future<void> fetchProjects() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      _projects = await ApiService.getProjects();
    } catch (e) {
      _errorMessage = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Project?> createProject(String name, {List<String>? emailFields}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      var newProject = await ApiService.createProject(name.trim());
      if (emailFields != null) {
        newProject = await ApiService.updateEmailFields(newProject.id, emailFields);
      }
      _projects.insert(0, newProject);
      _isLoading = false;
      notifyListeners();
      return newProject;
    } catch (e) {
      _errorMessage = e.toString();
      _isLoading = false;
      notifyListeners();
      return null;
    }
  }

  Future<bool> updateProject(
    String id, {
    String? name,
    List<ProjectFormField>? fields,
  }) async {
    try {
      final updated = await ApiService.updateProject(id, name: name, fields: fields);
      final index = _projects.indexWhere((p) => p.id == id);
      if (index != -1) {
        _projects[index] = updated.copyWith(
          submissionsCount: _projects[index].submissionsCount,
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

  Future<String?> regenerateApiKey(String id) async {
    try {
      final newKey = await ApiService.regenerateApiKey(id);
      final index = _projects.indexWhere((p) => p.id == id);
      if (index != -1) {
        _projects[index] = _projects[index].copyWith(apiKey: newKey);
        notifyListeners();
      }
      return newKey;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return null;
    }
  }

  Future<bool> updateEmailFields(String id, List<String>? emailFields) async {
    try {
      final updated = await ApiService.updateEmailFields(id, emailFields);
      final index = _projects.indexWhere((p) => p.id == id);
      if (index != -1) {
        _projects[index] = updated.copyWith(
          submissionsCount: _projects[index].submissionsCount,
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

  Future<bool> deleteProject(String id) async {
    try {
      await ApiService.deleteProject(id);
      _projects.removeWhere((p) => p.id == id);
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }
}
