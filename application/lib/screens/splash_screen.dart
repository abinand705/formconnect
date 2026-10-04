import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../theme/app_theme.dart';
import '../widgets/app_logo.dart';
import 'auth/login_screen.dart';
import 'main_layout_screen.dart';
import 'server_loading_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _opacityAnimation;

  String _statusText = 'Initializing FormConnect...';
  bool _isChecking = true;
  Timer? _initTimer;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );

    _scaleAnimation = Tween<double>(begin: 0.85, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    );

    _opacityAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );

    _controller.forward();

    _initTimer = Timer(const Duration(milliseconds: 800), () {
      if (mounted) {
        _evaluateServerAndAuth();
      }
    });
  }

  Future<void> _evaluateServerAndAuth() async {
    if (!mounted) return;

    setState(() {
      _statusText = 'Checking backend server...';
    });

    final authProvider = context.read<AuthProvider>();
    final targetUrl = authProvider.baseUrl;

    // Fast probe with 2.2 second timeout
    final probeResult = await ApiService.checkServerHealth(
      targetUrl,
      const Duration(milliseconds: 2200),
    );

    if (!mounted) return;

    if (probeResult.isHealthy) {
      // Server is already warm & online!
      setState(() {
        _isChecking = false;
        _statusText = 'Server online (${probeResult.latencyMs}ms)';
      });

      _initTimer = Timer(const Duration(milliseconds: 500), () {
        if (mounted) {
          _navigateToApp();
        }
      });
    } else {
      // Server is sleeping, cold-starting, or needs attention.
      // Transition smoothly to the full ServerLoadingScreen!
      Navigator.of(context).pushReplacement(
        PageRouteBuilder(
          pageBuilder: (context, animation, secondaryAnimation) =>
              const ServerLoadingScreen(),
          transitionsBuilder: (context, animation, secondaryAnimation, child) =>
              FadeTransition(opacity: animation, child: child),
          transitionDuration: const Duration(milliseconds: 500),
        ),
      );
    }
  }

  void _navigateToApp() {
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

  @override
  void dispose() {
    _initTimer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primaryForestDark,
      body: Center(
        child: FadeTransition(
          opacity: _opacityAnimation,
          child: ScaleTransition(
            scale: _scaleAnimation,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Brand Logo Icon
                Container(
                  width: 84,
                  height: 84,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(22),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.25),
                        blurRadius: 30,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: AppLogo(size: 54),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'FormConnect',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Your own contact-form backend',
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.7),
                    fontWeight: FontWeight.w400,
                  ),
                ),
                const SizedBox(height: 36),
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 250),
                  child: Row(
                    key: ValueKey<String>(_statusText),
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (_isChecking)
                        SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              AppColors.accentMint.withValues(alpha: 0.8),
                            ),
                          ),
                        )
                      else
                        const Icon(
                          Icons.check_circle_rounded,
                          color: Color(0xFF22C55E),
                          size: 18,
                        ),
                      const SizedBox(width: 10),
                      Text(
                        _statusText,
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.white.withValues(alpha: 0.8),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
