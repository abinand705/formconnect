import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/analytics_model.dart';
import '../models/project_model.dart';
import '../models/submission_model.dart';
import '../models/user_model.dart';
import 'storage_service.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, [this.statusCode]);

  @override
  String toString() => message;
}

class ApiService {
  static String get baseUrl => StorageService.getBaseUrl();

  static Map<String, String> _headers({String? token}) {
    final authToken = token ?? StorageService.getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (authToken != null && authToken.isNotEmpty)
        'Authorization': 'Bearer $authToken',
    };
  }

  // Connectivity Test
  static Future<bool> pingServer([String? testUrl]) async {
    final target = testUrl ?? baseUrl;
    try {
      final res = await http
          .get(Uri.parse('$target/api/stats'))
          .timeout(const Duration(seconds: 4));
      // Even if 401 Unauthorized, it means the server is reachable and active!
      return res.statusCode < 500;
    } catch (_) {
      return false;
    }
  }

  // -------------------------------------------------------------
  // AUTH
  // -------------------------------------------------------------

  static Future<UserModel> login(String email, String password) async {
    final uri = Uri.parse('$baseUrl/api/auth/login');
    final response = await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = _parseResponse(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return UserModel.fromJson(data);
    } else {
      throw ApiException(data['error'] ?? 'Login failed', response.statusCode);
    }
  }

  static Future<Map<String, dynamic>> register(String email, String password) async {
    final uri = Uri.parse('$baseUrl/api/auth/register');
    final response = await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode({'email': email, 'password': password}),
    );

    final data = _parseResponse(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    } else {
      throw ApiException(data['error'] ?? 'Registration failed', response.statusCode);
    }
  }

  static Future<void> changePassword(String currentPassword, String newPassword) async {
    final uri = Uri.parse('$baseUrl/api/auth/change-password');
    final response = await http.patch(
      uri,
      headers: _headers(),
      body: jsonEncode({
        'currentPassword': currentPassword,
        'newPassword': newPassword,
      }),
    );

    final data = _parseResponse(response);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(data['error'] ?? 'Failed to change password', response.statusCode);
    }
  }

  static Future<void> deleteAccount(String password) async {
    final uri = Uri.parse('$baseUrl/api/auth/account');
    final response = await http.delete(
      uri,
      headers: _headers(),
      body: jsonEncode({'password': password}),
    );

    final data = _parseResponse(response);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(data['error'] ?? 'Failed to delete account', response.statusCode);
    }
  }

  // -------------------------------------------------------------
  // PROJECTS
  // -------------------------------------------------------------

  static Future<List<Project>> getProjects() async {
    final uri = Uri.parse('$baseUrl/api/projects');
    final response = await http.get(uri, headers: _headers());

    if (response.statusCode == 200) {
      final List<dynamic> list = jsonDecode(response.body);
      return list.map((item) => Project.fromJson(item)).toList();
    } else {
      final data = _parseResponse(response);
      throw ApiException(data['error'] ?? 'Failed to load projects', response.statusCode);
    }
  }

  static Future<Project> createProject(String name) async {
    final uri = Uri.parse('$baseUrl/api/projects');
    final response = await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode({'name': name}),
    );

    final data = _parseResponse(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return Project.fromJson(data);
    } else {
      throw ApiException(data['error'] ?? 'Failed to create project', response.statusCode);
    }
  }

  static Future<Project> updateProject(
    String projectId, {
    String? name,
    List<ProjectFormField>? fields,
  }) async {
    final uri = Uri.parse('$baseUrl/api/projects/$projectId');
    final Map<String, dynamic> body = {};
    if (name != null) body['name'] = name;
    if (fields != null) body['fields'] = fields.map((f) => f.toJson()).toList();

    final response = await http.patch(
      uri,
      headers: _headers(),
      body: jsonEncode(body),
    );

    final data = _parseResponse(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return Project.fromJson(data);
    } else {
      throw ApiException(data['error'] ?? 'Failed to update project', response.statusCode);
    }
  }

  static Future<String> regenerateApiKey(String projectId) async {
    final uri = Uri.parse('$baseUrl/api/projects/$projectId/regenerate-key');
    final response = await http.post(uri, headers: _headers());

    final data = _parseResponse(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data['apiKey']?.toString() ?? '';
    } else {
      throw ApiException(data['error'] ?? 'Failed to regenerate API key', response.statusCode);
    }
  }

  static Future<Project> updateEmailFields(
    String projectId,
    List<String>? emailFields,
  ) async {
    final uri = Uri.parse('$baseUrl/api/projects/$projectId/email-fields');
    final response = await http.patch(
      uri,
      headers: _headers(),
      body: jsonEncode({'emailFields': emailFields}),
    );

    final data = _parseResponse(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return Project.fromJson(data);
    } else {
      throw ApiException(data['error'] ?? 'Failed to update email fields', response.statusCode);
    }
  }

  static Future<void> deleteProject(String projectId) async {
    final uri = Uri.parse('$baseUrl/api/projects/$projectId');
    final response = await http.delete(uri, headers: _headers());

    final data = _parseResponse(response);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(data['error'] ?? 'Failed to delete project', response.statusCode);
    }
  }

  // -------------------------------------------------------------
  // SUBMISSIONS
  // -------------------------------------------------------------

  static Future<List<Submission>> getSubmissions({String? projectId}) async {
    String url = '$baseUrl/api/submissions';
    if (projectId != null && projectId.isNotEmpty) {
      url += '?projectId=$projectId';
    }
    final uri = Uri.parse(url);
    final response = await http.get(uri, headers: _headers());

    if (response.statusCode == 200) {
      final List<dynamic> list = jsonDecode(response.body);
      return list.map((item) => Submission.fromJson(item)).toList();
    } else {
      final data = _parseResponse(response);
      throw ApiException(data['error'] ?? 'Failed to load submissions', response.statusCode);
    }
  }

  static Future<Submission> updateSubmissionRead(String id, bool read) async {
    final uri = Uri.parse('$baseUrl/api/submissions/$id');
    final response = await http.patch(
      uri,
      headers: _headers(),
      body: jsonEncode({'read': read}),
    );

    final data = _parseResponse(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return Submission.fromJson(data);
    } else {
      throw ApiException(data['error'] ?? 'Failed to update submission', response.statusCode);
    }
  }

  static Future<int> markAllSubmissionsRead({String? projectId}) async {
    final uri = Uri.parse('$baseUrl/api/submissions/mark-all-read');
    final Map<String, dynamic> body = {};
    if (projectId != null && projectId.isNotEmpty) {
      body['projectId'] = projectId;
    }

    final response = await http.post(
      uri,
      headers: _headers(),
      body: jsonEncode(body),
    );

    final data = _parseResponse(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data['count'] ?? 0;
    } else {
      throw ApiException(data['error'] ?? 'Failed to mark all as read', response.statusCode);
    }
  }

  static Future<void> deleteSubmission(String id) async {
    final uri = Uri.parse('$baseUrl/api/submissions/$id');
    final response = await http.delete(uri, headers: _headers());

    final data = _parseResponse(response);
    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw ApiException(data['error'] ?? 'Failed to delete submission', response.statusCode);
    }
  }

  // -------------------------------------------------------------
  // PUBLIC FORM SUBMISSION (Testing & Integration)
  // -------------------------------------------------------------

  static Future<String> submitForm({
    required String apiKey,
    required Map<String, dynamic> data,
    String? honeypot,
  }) async {
    final uri = Uri.parse('$baseUrl/api/submit');
    final response = await http.post(
      uri,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'},
      body: jsonEncode({
        'apiKey': apiKey,
        'data': data,
        'honeypot': ?honeypot,
      }),
    );

    final resData = _parseResponse(response);
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return resData['id']?.toString() ?? 'success';
    } else {
      throw ApiException(resData['error'] ?? 'Submission failed', response.statusCode);
    }
  }

  // -------------------------------------------------------------
  // STATS & ANALYTICS
  // -------------------------------------------------------------

  static Future<StatsData> getStats() async {
    final uri = Uri.parse('$baseUrl/api/stats');
    final response = await http.get(uri, headers: _headers());

    final data = _parseResponse(response);
    if (response.statusCode == 200) {
      return StatsData.fromJson(data);
    } else {
      throw ApiException(data['error'] ?? 'Failed to load stats', response.statusCode);
    }
  }

  static Future<AnalyticsData> getAnalytics() async {
    final uri = Uri.parse('$baseUrl/api/analytics');
    final response = await http.get(uri, headers: _headers());

    final data = _parseResponse(response);
    if (response.statusCode == 200) {
      return AnalyticsData.fromJson(data);
    } else {
      throw ApiException(data['error'] ?? 'Failed to load analytics', response.statusCode);
    }
  }

  // Helper parser
  static Map<String, dynamic> _parseResponse(http.Response response) {
    try {
      if (response.body.isEmpty) return {};
      return jsonDecode(response.body);
    } catch (_) {
      return {'error': response.body};
    }
  }

  static ApiException handleNetworkError(dynamic error) {
    if (error is ApiException) return error;
    final errStr = error.toString();
    if (errStr.contains('SocketException') ||
        errStr.contains('ClientException') ||
        errStr.contains('Connection timed out') ||
        errStr.contains('Connection refused') ||
        errStr.contains('Failed host lookup')) {
      return ApiException(
        'Cannot connect to backend server at $baseUrl.\n\n'
        'Ensure the backend is running (npm start in backend) and reachable, '
        'or tap the server chip at the top right to switch your API URL.',
      );
    }
    return ApiException(errStr);
  }
}
