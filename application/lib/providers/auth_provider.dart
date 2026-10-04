import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/api_service.dart';
import '../services/storage_service.dart';

enum AuthStatus { initial, authenticated, unauthenticated }

class AuthProvider extends ChangeNotifier {
  AuthStatus _status = AuthStatus.initial;
  UserModel? _user;
  bool _isLoading = false;
  String? _errorMessage;
  String _baseUrl = StorageService.getBaseUrl();
  bool _isServerHealthy = false;
  bool _isCheckingServer = false;
  int? _serverLatencyMs;
  String? _serverStatusMessage;

  AuthStatus get status => _status;
  UserModel? get user => _user;
  bool get isAuthenticated => _status == AuthStatus.authenticated;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;
  String get baseUrl => _baseUrl;
  bool get isServerHealthy => _isServerHealthy;
  bool get isCheckingServer => _isCheckingServer;
  int? get serverLatencyMs => _serverLatencyMs;
  String? get serverStatusMessage => _serverStatusMessage;

  AuthProvider() {
    _initFromStorage();
  }

  void _initFromStorage() {
    final token = StorageService.getAuthToken();
    final email = StorageService.getUserEmail();
    final userId = StorageService.getUserId();
    _baseUrl = StorageService.getBaseUrl();

    if (token != null && email != null) {
      _user = UserModel(id: userId ?? '', email: email, token: token);
      _status = AuthStatus.authenticated;
    } else {
      _status = AuthStatus.unauthenticated;
    }
    notifyListeners();
  }

  Future<void> updateBaseUrl(String newUrl) async {
    await StorageService.setBaseUrl(newUrl);
    _baseUrl = StorageService.getBaseUrl();
    _isServerHealthy = false;
    notifyListeners();
    await checkServerHealth();
  }

  Future<ServerHealthResult> checkServerHealth([String? targetUrl]) async {
    _isCheckingServer = true;
    notifyListeners();

    final result = await ApiService.checkServerHealth(targetUrl ?? _baseUrl);
    _isServerHealthy = result.isHealthy;
    _serverLatencyMs = result.latencyMs;
    _serverStatusMessage = result.message;
    _isCheckingServer = false;
    notifyListeners();

    return result;
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    _clearError();

    try {
      final userModel = await ApiService.login(email.trim(), password);
      if (userModel.token != null) {
        await StorageService.setAuthToken(userModel.token!);
        await StorageService.setUserEmail(userModel.email);
        await StorageService.setUserId(userModel.id);
        _user = userModel;
        _status = AuthStatus.authenticated;
        _setLoading(false);
        return true;
      } else {
        throw ApiException('Invalid server response');
      }
    } catch (e) {
      _errorMessage = ApiService.handleNetworkError(e).message;
      _setLoading(false);
      return false;
    }
  }

  Future<bool> register(String email, String password) async {
    _setLoading(true);
    _clearError();

    try {
      await ApiService.register(email.trim(), password);
      // Auto-login after successful registration
      return await login(email, password);
    } catch (e) {
      _errorMessage = ApiService.handleNetworkError(e).message;
      _setLoading(false);
      return false;
    }
  }

  Future<bool> changePassword(String currentPassword, String newPassword) async {
    _setLoading(true);
    _clearError();

    try {
      await ApiService.changePassword(currentPassword, newPassword);
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = ApiService.handleNetworkError(e).message;
      _setLoading(false);
      return false;
    }
  }

  Future<bool> deleteAccount(String password) async {
    _setLoading(true);
    _clearError();

    try {
      await ApiService.deleteAccount(password);
      await logout();
      _setLoading(false);
      return true;
    } catch (e) {
      _errorMessage = ApiService.handleNetworkError(e).message;
      _setLoading(false);
      return false;
    }
  }

  Future<void> logout() async {
    await StorageService.clearAuth();
    _user = null;
    _status = AuthStatus.unauthenticated;
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }

  void _clearError() {
    _errorMessage = null;
  }
}
