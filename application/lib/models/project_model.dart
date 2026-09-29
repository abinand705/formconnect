import '../utils/date_formatter.dart';

class ProjectFormField {
  String name;
  String type; // text, email, textarea, number, tel
  bool required;

  ProjectFormField({
    required this.name,
    this.type = 'text',
    this.required = true,
  });

  factory ProjectFormField.fromJson(Map<String, dynamic> json) {
    return ProjectFormField(
      name: json['name']?.toString() ?? '',
      type: json['type']?.toString() ?? 'text',
      required: json['required'] == true,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'name': name,
      'type': type,
      'required': required,
    };
  }

  ProjectFormField copyWith({
    String? name,
    String? type,
    bool? required,
  }) {
    return ProjectFormField(
      name: name ?? this.name,
      type: type ?? this.type,
      required: required ?? this.required,
    );
  }
}

class Project {
  final String id;
  final String name;
  final String apiKey;
  final List<ProjectFormField> fields;
  final List<String>? emailFields;
  final String? userId;
  final DateTime? createdAt;
  final int submissionsCount;

  Project({
    required this.id,
    required this.name,
    required this.apiKey,
    required this.fields,
    this.emailFields,
    this.userId,
    this.createdAt,
    this.submissionsCount = 0,
  });

  factory Project.fromJson(Map<String, dynamic> json) {
    List<ProjectFormField> parsedFields = [];
    if (json['fields'] != null && json['fields'] is List) {
      parsedFields = (json['fields'] as List)
          .whereType<Map<String, dynamic>>()
          .map((f) => ProjectFormField.fromJson(f))
          .toList();
    }

    List<String>? parsedEmailFields;
    if (json['emailFields'] != null && json['emailFields'] is List) {
      parsedEmailFields = (json['emailFields'] as List)
          .map((e) => e.toString())
          .toList();
    }

    int count = 0;
    if (json['_count'] != null && json['_count']['submissions'] != null) {
      count = int.tryParse(json['_count']['submissions'].toString()) ?? 0;
    } else if (json['submissionsCount'] != null) {
      count = int.tryParse(json['submissionsCount'].toString()) ?? 0;
    }

    return Project(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Untitled Project',
      apiKey: json['apiKey']?.toString() ?? '',
      fields: parsedFields.isNotEmpty
          ? parsedFields
          : [
              ProjectFormField(name: 'name', type: 'text', required: true),
              ProjectFormField(name: 'email', type: 'email', required: true),
              ProjectFormField(name: 'message', type: 'textarea', required: true),
            ],
      emailFields: parsedEmailFields,
      userId: json['userId']?.toString(),
      createdAt: DateFormatter.parseIso(json['createdAt']),
      submissionsCount: count,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'apiKey': apiKey,
      'fields': fields.map((f) => f.toJson()).toList(),
      if (emailFields != null) 'emailFields': emailFields,
      if (userId != null) 'userId': userId,
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
    };
  }

  Project copyWith({
    String? id,
    String? name,
    String? apiKey,
    List<ProjectFormField>? fields,
    List<String>? emailFields,
    String? userId,
    DateTime? createdAt,
    int? submissionsCount,
  }) {
    return Project(
      id: id ?? this.id,
      name: name ?? this.name,
      apiKey: apiKey ?? this.apiKey,
      fields: fields ?? this.fields,
      emailFields: emailFields ?? this.emailFields,
      userId: userId ?? this.userId,
      createdAt: createdAt ?? this.createdAt,
      submissionsCount: submissionsCount ?? this.submissionsCount,
    );
  }
}
