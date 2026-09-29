class UserModel {
  final String id;
  final String email;
  final String? token;

  UserModel({
    required this.id,
    required this.email,
    this.token,
  });

  factory UserModel.fromJson(Map<String, dynamic> json, {String? token}) {
    return UserModel(
      id: json['userId'] ?? json['id'] ?? '',
      email: json['email'] ?? '',
      token: token ?? json['token'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      if (token != null) 'token': token,
    };
  }
}
