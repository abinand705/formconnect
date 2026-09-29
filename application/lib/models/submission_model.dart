import '../utils/date_formatter.dart';

class Submission {
  final String id;
  final String projectId;
  final String? projectName;
  final String? projectApiKey;
  final Map<String, dynamic> data;
  final bool read;
  final DateTime? createdAt;

  Submission({
    required this.id,
    required this.projectId,
    this.projectName,
    this.projectApiKey,
    required this.data,
    required this.read,
    this.createdAt,
  });

  factory Submission.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic> parsedData = {};
    if (json['data'] != null && json['data'] is Map) {
      parsedData = Map<String, dynamic>.from(json['data']);
    }

    String? pName;
    String? pKey;
    if (json['project'] != null && json['project'] is Map) {
      pName = json['project']['name']?.toString();
      pKey = json['project']['apiKey']?.toString();
    }

    return Submission(
      id: json['id']?.toString() ?? '',
      projectId: json['projectId']?.toString() ?? '',
      projectName: pName,
      projectApiKey: pKey,
      data: parsedData,
      read: json['read'] == true,
      createdAt: DateFormatter.parseIso(json['createdAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'projectId': projectId,
      'data': data,
      'read': read,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    };
  }

  Submission copyWith({
    String? id,
    String? projectId,
    String? projectName,
    String? projectApiKey,
    Map<String, dynamic>? data,
    bool? read,
    DateTime? createdAt,
  }) {
    return Submission(
      id: id ?? this.id,
      projectId: projectId ?? this.projectId,
      projectName: projectName ?? this.projectName,
      projectApiKey: projectApiKey ?? this.projectApiKey,
      data: data ?? this.data,
      read: read ?? this.read,
      createdAt: createdAt ?? this.createdAt,
    );
  }

  // Quick field getters for preview cards
  String get displayName {
    for (final key in ['name', 'fullName', 'full_name', 'sender', 'user', 'author']) {
      if (data.containsKey(key) && data[key] != null && data[key].toString().isNotEmpty) {
        return data[key].toString();
      }
    }
    return 'Anonymous';
  }

  String? get displayEmail {
    for (final key in ['email', 'userEmail', 'contact_email', 'mail']) {
      if (data.containsKey(key) && data[key] != null && data[key].toString().isNotEmpty) {
        return data[key].toString();
      }
    }
    return null;
  }

  String get displayMessage {
    for (final key in ['message', 'body', 'feedback', 'inquiry', 'content', 'comment', 'description']) {
      if (data.containsKey(key) && data[key] != null && data[key].toString().isNotEmpty) {
        return data[key].toString();
      }
    }
    if (data.isNotEmpty) {
      final firstVal = data.values.first;
      return firstVal?.toString() ?? 'No text content';
    }
    return 'Empty submission';
  }
}
