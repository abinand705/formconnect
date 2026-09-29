import 'package:shared_preferences/shared_preferences.dart';
import '../utils/constants.dart';

class StorageService {
  static SharedPreferences? _prefs;

  static Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  static String? getAuthToken() {
    return _prefs?.getString(AppConstants.keyAuthToken);
  }

  static Future<void> setAuthToken(String token) async {
    await _prefs?.setString(AppConstants.keyAuthToken, token);
  }

  static String? getUserEmail() {
    return _prefs?.getString(AppConstants.keyUserEmail);
  }

  static Future<void> setUserEmail(String email) async {
    await _prefs?.setString(AppConstants.keyUserEmail, email);
  }

  static String? getUserId() {
    return _prefs?.getString(AppConstants.keyUserId);
  }

  static Future<void> setUserId(String id) async {
    await _prefs?.setString(AppConstants.keyUserId, id);
  }

  static String getBaseUrl() {
    final customUrl = _prefs?.getString(AppConstants.keyBaseUrl);
    if (customUrl != null && customUrl.trim().isNotEmpty) {
      return customUrl.trim();
    }
    return AppConstants.defaultBaseUrl;
  }

  static Future<void> setBaseUrl(String url) async {
    await _prefs?.setString(AppConstants.keyBaseUrl, url.trim());
  }

  static Future<void> clearAuth() async {
    await _prefs?.remove(AppConstants.keyAuthToken);
    await _prefs?.remove(AppConstants.keyUserEmail);
    await _prefs?.remove(AppConstants.keyUserId);
  }
}
