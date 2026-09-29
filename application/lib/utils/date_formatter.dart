import 'package:intl/intl.dart';

class DateFormatter {
  static String getRelativeTime(DateTime? date) {
    if (date == null) return 'No activity yet';
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inSeconds < 45) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      final mins = difference.inMinutes;
      return '$mins minute${mins > 1 ? 's' : ''} ago';
    } else if (difference.inHours < 24) {
      final hours = difference.inHours;
      return '$hours hour${hours > 1 ? 's' : ''} ago';
    } else if (difference.inDays < 30) {
      final days = difference.inDays;
      return '$days day${days > 1 ? 's' : ''} ago';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return '$months month${months > 1 ? 's' : ''} ago';
    } else {
      final years = (difference.inDays / 365).floor();
      return '$years year${years > 1 ? 's' : ''} ago';
    }
  }

  static String formatFull(DateTime? date) {
    if (date == null) return 'N/A';
    return DateFormat('MMM dd, yyyy • h:mm a').format(date.toLocal());
  }

  static String formatDateOnly(DateTime? date) {
    if (date == null) return 'N/A';
    return DateFormat('MMM dd, yyyy').format(date.toLocal());
  }

  static String formatShortDate(DateTime? date) {
    if (date == null) return 'N/A';
    return DateFormat('MMM d').format(date.toLocal());
  }

  static DateTime? parseIso(dynamic value) {
    if (value == null) return null;
    if (value is DateTime) return value;
    if (value is String) {
      try {
        return DateTime.parse(value);
      } catch (_) {
        return null;
      }
    }
    return null;
  }
}
