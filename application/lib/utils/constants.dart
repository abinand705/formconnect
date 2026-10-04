class AppConstants {
  static const String appName = 'FormConnect';
  static const String appTagline = 'Your own contact-form backend';

  // Storage Keys
  static const String keyAuthToken = 'formconnect_auth_token';
  static const String keyUserEmail = 'formconnect_user_email';
  static const String keyUserId = 'formconnect_user_id';
  static const String keyBaseUrl = 'formconnect_base_url';

  // Your PC's Wi-Fi LAN IP
  static const String localWifiIp = '192.168.1.25';

  // Default Base URL
  static String get defaultBaseUrl {
    // Both localhost:5000 (with adb reverse) and LAN IP work on physical devices and desktop/web
    return 'http://localhost:5000';
  }

  // Pre-configured server presets
  static const List<Map<String, String>> serverPresets = [
    {
      'label': 'Physical Phone / USB (localhost)',
      'url': 'http://localhost:5000',
      'desc': 'For phone connected via USB cable (with adb reverse)',
    },
    {
      'label': 'Wi-Fi LAN (192.168.1.25)',
      'url': 'http://192.168.1.25:5000',
      'desc': 'For physical phone connected to the same Wi-Fi',
    },
    {
      'label': 'Android Studio Emulator (10.0.2.2)',
      'url': 'http://10.0.2.2:5000',
      'desc': 'For Android Studio Virtual Device emulator',
    },
    {
      'label': 'Cloud Render API',
      'url': 'https://formconnect.onrender.com',
      'desc': 'Live production backend deployment',
    },
  ];
}
