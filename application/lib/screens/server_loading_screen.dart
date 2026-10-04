import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../utils/constants.dart';
import '../widgets/app_button.dart';
import '../widgets/app_logo.dart';
import '../widgets/server_loading_animation.dart';
import 'auth/login_screen.dart';
import 'main_layout_screen.dart';
import 'settings/server_config_dialog.dart';

class ServerLoadingScreen extends StatefulWidget {
  final bool autoNavigateOnSuccess;
  final VoidCallback? onConnected;

  const ServerLoadingScreen({
    super.key,
    this.autoNavigateOnSuccess = true,
    this.onConnected,
  });

  static Future<bool?> showAsDialog(BuildContext context) {
    return showDialog<bool>(
      context: context,
      barrierDismissible: true,
      builder: (ctx) {
        final mediaQuery = MediaQuery.of(ctx);
        final availableHeight = mediaQuery.size.height - mediaQuery.viewInsets.bottom;

        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          child: ClipRRect(
            borderRadius: const BorderRadius.all(Radius.circular(24)),
            child: ConstrainedBox(
              constraints: BoxConstraints(
                maxWidth: 440,
                maxHeight: (availableHeight * 0.88).clamp(320.0, 620.0),
              ),
              child: const ServerLoadingScreen(autoNavigateOnSuccess: false),
            ),
          ),
        );
      },
    );
  }

  @override
  State<ServerLoadingScreen> createState() => _ServerLoadingScreenState();
}

class _ServerLoadingScreenState extends State<ServerLoadingScreen> {
  ServerLoadingState _state = ServerLoadingState.connecting;
  int _elapsedSeconds = 0;
  Timer? _tickerTimer;
  Timer? _pollTimer;
  bool _isDisposed = false;
  String? _lastError;
  int? _latencyMs;
  int _attemptCount = 0;

  @override
  void initState() {
    super.initState();
    _startTimer();
    _checkServer();
  }

  void _startTimer() {
    _tickerTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      setState(() {
        _elapsedSeconds++;
        if (_elapsedSeconds >= 4 && _state == ServerLoadingState.connecting) {
          _state = ServerLoadingState.wakingUp;
        }
      });
    });
  }

  Future<void> _checkServer() async {
    if (_isDisposed) return;
    _attemptCount++;

    final authProvider = context.read<AuthProvider>();
    final targetUrl = authProvider.baseUrl;

    try {
      final result = await ApiService.checkServerHealth(
        targetUrl,
        const Duration(seconds: 4),
      );

      if (_isDisposed || !mounted) return;

      if (result.isHealthy) {
        setState(() {
          _state = ServerLoadingState.connected;
          _latencyMs = result.latencyMs;
          _lastError = null;
        });

        _tickerTimer?.cancel();
        _pollTimer?.cancel();

        if (widget.onConnected != null) {
          widget.onConnected!();
        }

        if (widget.autoNavigateOnSuccess) {
          await Future.delayed(const Duration(milliseconds: 700));
          if (!mounted) return;
          _navigateToDestination();
        }
      } else {
        // Not ready yet
        setState(() {
          _state = _elapsedSeconds >= 12
              ? ServerLoadingState.wakingUp
              : ServerLoadingState.connecting;
          _lastError = result.message;
        });
        _scheduleNextPoll();
      }
    } catch (e) {
      if (_isDisposed || !mounted) return;
      setState(() {
        _lastError = e.toString();
        _state = _elapsedSeconds >= 20
            ? ServerLoadingState.error
            : ServerLoadingState.wakingUp;
      });
      _scheduleNextPoll();
    }
  }

  void _scheduleNextPoll() {
    _pollTimer?.cancel();
    if (_isDisposed || !mounted) return;

    // Fast poll while waiting for server to spin up
    _pollTimer = Timer(const Duration(seconds: 3), () {
      if (!mounted) return;
      _checkServer();
    });
  }

  void _handleManualRetry() {
    setState(() {
      _state = _elapsedSeconds > 4
          ? ServerLoadingState.wakingUp
          : ServerLoadingState.connecting;
    });
    _checkServer();
  }

  void _navigateToDestination() {
    final authProvider = context.read<AuthProvider>();
    final targetScreen = authProvider.isAuthenticated
        ? const MainLayoutScreen()
        : const LoginScreen();

    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (context, animation, secondaryAnimation) => targetScreen,
        transitionsBuilder: (context, animation, secondaryAnimation, child) =>
            FadeTransition(opacity: animation, child: child),
        transitionDuration: const Duration(milliseconds: 400),
      ),
    );
  }

  void _handleSkipOffline() {
    _tickerTimer?.cancel();
    _pollTimer?.cancel();

    if (!widget.autoNavigateOnSuccess) {
      Navigator.of(context).pop(false);
      return;
    }

    _navigateToDestination();
  }

  Future<void> _handleChangeServer() async {
    await ServerConfigDialog.show(context);
    if (!mounted) return;
    // Reset timers and check the new URL immediately
    setState(() {
      _elapsedSeconds = 0;
      _attemptCount = 0;
      _state = ServerLoadingState.connecting;
      _lastError = null;
    });
    _checkServer();
  }

  @override
  void dispose() {
    _isDisposed = true;
    _tickerTimer?.cancel();
    _pollTimer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = context.watch<AuthProvider>();
    final currentUrl = authProvider.baseUrl;

    return Scaffold(
      backgroundColor: AppColors.primaryForestDark,
      body: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 460),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Top App Logo & Branding
                      _buildHeader(),

                      const SizedBox(height: 28),

                      // Animated Server Pulse & Radar
                      ServerLoadingAnimation(
                        state: _state,
                        size: 150,
                        onRetry: _handleManualRetry,
                      ),

                      const SizedBox(height: 24),

                      // Status Title & Detailed Description
                      _buildStatusInfo(),

                      const SizedBox(height: 24),

                      // Current Server Chip & Presets Switcher
                      _buildServerTargetCard(currentUrl),

                      const SizedBox(height: 28),

                      // Action Buttons
                      _buildActionButtons(),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 44,
          height: 44,
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 16,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: const Center(
            child: AppLogo(size: 28),
          ),
        ),
        const SizedBox(width: 12),
        const Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'FormConnect',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.w800,
                color: Colors.white,
                letterSpacing: -0.3,
              ),
            ),
            Text(
              'Backend Gateway',
              style: TextStyle(
                fontSize: 11,
                color: Color(0xFF94A3B8),
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildStatusInfo() {
    String title;
    String description;
    Color statusColor;

    switch (_state) {
      case ServerLoadingState.connected:
        title = 'Server Online & Ready';
        description = _latencyMs != null
            ? 'Connected in ${_latencyMs}ms. Loading workspace...'
            : 'Connected successfully to FormConnect backend.';
        statusColor = const Color(0xFF22C55E);
        break;

      case ServerLoadingState.wakingUp:
        title = 'Waking Up Cloud Server';
        description =
            'Free cloud backends (like Render) sleep after inactivity and need 30–50s to spin up. Please wait a moment...';
        statusColor = const Color(0xFFF59E0B);
        break;

      case ServerLoadingState.error:
        title = 'Server Unreachable';
        description = _lastError ??
            'Could not establish connection to the server. Check Wi-Fi or select a different preset.';
        statusColor = const Color(0xFFEF4444);
        break;

      case ServerLoadingState.connecting:
        title = 'Connecting to Server...';
        description = 'Testing network connectivity and backend service health.';
        statusColor = const Color(0xFF10B981);
        break;
    }

    return Column(
      children: [
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          child: Row(
            key: ValueKey<String>(title),
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: statusColor,
                  boxShadow: [
                    BoxShadow(
                      color: statusColor.withValues(alpha: 0.6),
                      blurRadius: 8,
                      spreadRadius: 1,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                  letterSpacing: -0.2,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            description,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              color: Colors.white.withValues(alpha: 0.72),
              height: 1.4,
            ),
          ),
        ),
        const SizedBox(height: 14),

        // Live Elapsed Timer Chip
        if (_state != ServerLoadingState.connected)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: Colors.white.withValues(alpha: 0.12),
                width: 1,
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(
                  Icons.timer_outlined,
                  size: 14,
                  color: Color(0xFF38BDF8),
                ),
                const SizedBox(width: 6),
                Text(
                  'Elapsed: ${_elapsedSeconds}s (Attempt $_attemptCount)',
                  style: const TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFFE2E8F0),
                    fontFamily: 'monospace',
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildServerTargetCard(String currentUrl) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0F261E),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF22C55E).withValues(alpha: 0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Row(
                children: [
                  Icon(
                    Icons.dns_rounded,
                    size: 15,
                    color: Color(0xFF22C55E),
                  ),
                  SizedBox(width: 6),
                  Text(
                    'TARGET SERVER',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.1,
                      color: Color(0xFF94A3B8),
                    ),
                  ),
                ],
              ),
              InkWell(
                onTap: _handleChangeServer,
                borderRadius: BorderRadius.circular(6),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  child: Row(
                    children: [
                      Text(
                        'Change',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: AppColors.accentMint,
                        ),
                      ),
                      const SizedBox(width: 2),
                      Icon(
                        Icons.edit_rounded,
                        size: 12,
                        color: AppColors.accentMint,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            currentUrl,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: Colors.white,
              fontFamily: 'monospace',
            ),
          ),
          const SizedBox(height: 8),

          // Preset Quick Switch Buttons
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: AppConstants.serverPresets.map((preset) {
                final isSelected = currentUrl == preset['url'];
                return Padding(
                  padding: const EdgeInsets.only(right: 6),
                  child: ActionChip(
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    visualDensity: VisualDensity.compact,
                    backgroundColor: isSelected
                        ? AppColors.accentMint.withValues(alpha: 0.2)
                        : Colors.white.withValues(alpha: 0.05),
                    side: BorderSide(
                      color: isSelected
                          ? AppColors.accentMint
                          : Colors.white.withValues(alpha: 0.1),
                    ),
                    label: Text(
                      preset['label']!.split('(').first.trim(),
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                        color: isSelected ? Colors.white : const Color(0xFFCBD5E1),
                      ),
                    ),
                    onPressed: () async {
                      await context.read<AuthProvider>().updateBaseUrl(preset['url']!);
                      if (!mounted) return;
                      _handleManualRetry();
                    },
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButtons() {
    if (_state == ServerLoadingState.connected) {
      return SizedBox(
        width: double.infinity,
        child: AppButton(
          text: 'Enter FormConnect',
          icon: Icons.arrow_forward_rounded,
          onPressed: _navigateToDestination,
        ),
      );
    }

    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  side: BorderSide(
                    color: Colors.white.withValues(alpha: 0.2),
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: _handleManualRetry,
                icon: const Icon(Icons.refresh_rounded, size: 16, color: Colors.white),
                label: const Text(
                  'Retry Now',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.accentMint,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 13),
                  elevation: 0,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: _handleChangeServer,
                icon: const Icon(Icons.settings_ethernet_rounded, size: 16),
                label: const Text(
                  'Presets',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        TextButton(
          onPressed: _handleSkipOffline,
          child: Text(
            'Skip & Continue Anyway (Offline)',
            style: TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: Colors.white.withValues(alpha: 0.6),
              decoration: TextDecoration.underline,
            ),
          ),
        ),
      ],
    );
  }
}
