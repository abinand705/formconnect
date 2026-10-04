import 'dart:math' as math;
import 'package:flutter/material.dart';

enum ServerLoadingState {
  connecting,
  wakingUp,
  connected,
  error,
}

class ServerLoadingAnimation extends StatefulWidget {
  final ServerLoadingState state;
  final double size;
  final String? customMessage;
  final VoidCallback? onRetry;

  const ServerLoadingAnimation({
    super.key,
    this.state = ServerLoadingState.connecting,
    this.size = 140,
    this.customMessage,
    this.onRetry,
  });

  @override
  State<ServerLoadingAnimation> createState() => _ServerLoadingAnimationState();
}

class _ServerLoadingAnimationState extends State<ServerLoadingAnimation>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _ledController;
  late AnimationController _floatController;
  late AnimationController _successController;

  @override
  void initState() {
    super.initState();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat();

    _ledController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat();

    _floatController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    )..repeat(reverse: true);

    _successController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );

    if (widget.state == ServerLoadingState.connected) {
      _successController.forward();
    }
  }

  @override
  void didUpdateWidget(covariant ServerLoadingAnimation oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.state == ServerLoadingState.connected &&
        oldWidget.state != ServerLoadingState.connected) {
      _successController.forward(from: 0.0);
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _ledController.dispose();
    _floatController.dispose();
    _successController.dispose();
    super.dispose();
  }

  Color get _primaryAccent {
    switch (widget.state) {
      case ServerLoadingState.connecting:
        return const Color(0xFF10B981); // Emerald Mint
      case ServerLoadingState.wakingUp:
        return const Color(0xFFF59E0B); // Amber Glow
      case ServerLoadingState.connected:
        return const Color(0xFF22C55E); // Crisp Green
      case ServerLoadingState.error:
        return const Color(0xFFEF4444); // Crimson Alert
    }
  }

  @override
  Widget build(BuildContext context) {
    final double size = widget.size;

    return Center(
      child: SizedBox(
        width: size * 1.6,
        height: size * 1.6,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Radar Wave Ripples
            AnimatedBuilder(
              animation: _pulseController,
              builder: (context, child) {
                return CustomPaint(
                  size: Size(size * 1.6, size * 1.6),
                  painter: _RadarWavesPainter(
                    animationValue: _pulseController.value,
                    color: _primaryAccent,
                    isError: widget.state == ServerLoadingState.error,
                    isConnected: widget.state == ServerLoadingState.connected,
                  ),
                );
              },
            ),

            // Floating Main Server Chassis
            AnimatedBuilder(
              animation: _floatController,
              builder: (context, child) {
                final double floatOffset = math.sin(_floatController.value * math.pi) * 4;
                return Transform.translate(
                  offset: Offset(0, -floatOffset),
                  child: child,
                );
              },
              child: _buildServerChassis(size),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServerChassis(double size) {
    final Color accent = _primaryAccent;
    final bool isConnected = widget.state == ServerLoadingState.connected;
    final bool isError = widget.state == ServerLoadingState.error;

    return Container(
      width: size,
      height: size * 0.92,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(22),
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF0F261E),
            const Color(0xFF071712),
          ],
        ),
        border: Border.all(
          color: accent.withValues(alpha: isConnected ? 0.8 : 0.35),
          width: isConnected ? 2.0 : 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: accent.withValues(alpha: isConnected ? 0.35 : 0.18),
            blurRadius: isConnected ? 30 : 20,
            spreadRadius: isConnected ? 4 : 1,
            offset: const Offset(0, 8),
          ),
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.6),
            blurRadius: 16,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(21),
        child: Stack(
          children: [
            // Top Subtle Ambient Glass Glare
            Positioned(
              top: 0,
              left: 0,
              right: 0,
              height: size * 0.35,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.white.withValues(alpha: 0.08),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),

            // Server Internal Racks Layout
            Padding(
              padding: EdgeInsets.all(size * 0.1),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Upper Rack Tray
                  _buildServerBay(
                    size: size,
                    title: 'FC-SRV 01',
                    accentColor: accent,
                    ledIndex: 0,
                  ),

                  // Middle Core Status Display
                  Expanded(
                    child: Center(
                      child: _buildCoreIndicator(size),
                    ),
                  ),

                  // Lower Rack Tray
                  _buildServerBay(
                    size: size,
                    title: isError
                        ? 'OFFLINE'
                        : isConnected
                            ? '200 OK'
                            : 'WAKING',
                    accentColor: accent,
                    ledIndex: 1,
                    isStatusTray: true,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServerBay({
    required double size,
    required String title,
    required Color accentColor,
    required int ledIndex,
    bool isStatusTray = false,
  }) {
    return Container(
      height: size * 0.18,
      padding: EdgeInsets.symmetric(horizontal: size * 0.08),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.04),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.07),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          // Server vent slots & title
          Expanded(
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Vent grills
                Row(
                  children: List.generate(
                    2,
                    (i) => Container(
                      width: 2.5,
                      height: size * 0.08,
                      margin: const EdgeInsets.only(right: 2.5),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(1),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 4),
                Flexible(
                  child: Text(
                    title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: isStatusTray
                          ? accentColor
                          : Colors.white.withValues(alpha: 0.7),
                      fontSize: (size * 0.065).clamp(8.0, 11.0),
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.5,
                      fontFamily: 'monospace',
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 4),

          // Active Blinking LEDs
          AnimatedBuilder(
            animation: _ledController,
            builder: (context, child) {
              return Row(
                children: [
                  // LED 1: Heartbeat
                  _buildLedDot(
                    color: accentColor,
                    isActive: _calculateBlink(ledIndex, 0),
                  ),
                  const SizedBox(width: 4),
                  // LED 2: Packet transfer
                  _buildLedDot(
                    color: widget.state == ServerLoadingState.error
                        ? const Color(0xFFEF4444)
                        : const Color(0xFF38BDF8), // Cyan link
                    isActive: _calculateBlink(ledIndex, 1),
                  ),
                  const SizedBox(width: 4),
                  // LED 3: Storage
                  _buildLedDot(
                    color: const Color(0xFFA855F7), // Purple write
                    isActive: _calculateBlink(ledIndex, 2),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  bool _calculateBlink(int tray, int led) {
    if (widget.state == ServerLoadingState.error) {
      return tray == 1 && led == 0;
    }
    if (widget.state == ServerLoadingState.connected) {
      return led == 0 || (led == 1 && _ledController.value > 0.4);
    }
    final double v = (_ledController.value + (tray * 0.3) + (led * 0.2)) % 1.0;
    return v < 0.55;
  }

  Widget _buildLedDot({required Color color, required bool isActive}) {
    return Container(
      width: 6,
      height: 6,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: isActive ? color : color.withValues(alpha: 0.2),
        boxShadow: isActive
            ? [
                BoxShadow(
                  color: color.withValues(alpha: 0.8),
                  blurRadius: 5,
                  spreadRadius: 1,
                ),
              ]
            : null,
      ),
    );
  }

  Widget _buildCoreIndicator(double size) {
    switch (widget.state) {
      case ServerLoadingState.connected:
        return ScaleTransition(
          scale: CurvedAnimation(
            parent: _successController,
            curve: Curves.elasticOut,
          ),
          child: Container(
            width: size * 0.26,
            height: size * 0.26,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: const Color(0xFF22C55E).withValues(alpha: 0.15),
              border: Border.all(color: const Color(0xFF22C55E), width: 2),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF22C55E).withValues(alpha: 0.4),
                  blurRadius: 12,
                ),
              ],
            ),
            child: const Icon(
              Icons.check_rounded,
              color: Color(0xFF22C55E),
              size: 26,
            ),
          ),
        );

      case ServerLoadingState.error:
        return GestureDetector(
          onTap: widget.onRetry,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFFEF4444).withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: const Color(0xFFEF4444).withValues(alpha: 0.4),
                width: 1,
              ),
            ),
            child: const FittedBox(
              fit: BoxFit.scaleDown,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.refresh_rounded, color: Color(0xFFEF4444), size: 14),
                  SizedBox(width: 4),
                  Text(
                    'Retry',
                    style: TextStyle(
                      color: Color(0xFFEF4444),
                      fontSize: 10,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),
          ),
        );

      case ServerLoadingState.wakingUp:
      case ServerLoadingState.connecting:
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.dns_rounded,
              size: size * 0.18,
              color: _primaryAccent.withValues(alpha: 0.85),
            ),
            const SizedBox(width: 8),
            SizedBox(
              width: size * 0.14,
              height: size * 0.14,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(_primaryAccent),
              ),
            ),
          ],
        );
    }
  }
}

class _RadarWavesPainter extends CustomPainter {
  final double animationValue;
  final Color color;
  final bool isError;
  final bool isConnected;

  _RadarWavesPainter({
    required this.animationValue,
    required this.color,
    required this.isError,
    required this.isConnected,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final Offset center = Offset(size.width / 2, size.height / 2);
    final double maxRadius = size.width / 2;

    if (isConnected) {
      // Single gentle steady glow ring
      final paint = Paint()
        ..color = color.withValues(alpha: 0.2)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0;
      canvas.drawCircle(center, maxRadius * 0.82, paint);
      return;
    }

    if (isError) {
      // Static dashed warning ring
      final paint = Paint()
        ..color = color.withValues(alpha: 0.25)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.5;
      canvas.drawCircle(center, maxRadius * 0.8, paint);
      return;
    }

    // 3 Dynamic expanding radar waves
    const int waveCount = 3;
    for (int i = 0; i < waveCount; i++) {
      final double progress = (animationValue + (i / waveCount)) % 1.0;
      final double radius = (maxRadius * 0.52) + (progress * maxRadius * 0.44);
      final double opacity = math.sin((1.0 - progress) * math.pi / 2).clamp(0.0, 1.0) * 0.4;

      final wavePaint = Paint()
        ..color = color.withValues(alpha: opacity)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.8 * (1.0 - (progress * 0.5));

      canvas.drawCircle(center, radius, wavePaint);
    }
  }

  @override
  bool shouldRepaint(covariant _RadarWavesPainter oldDelegate) {
    return oldDelegate.animationValue != animationValue ||
        oldDelegate.color != color ||
        oldDelegate.isConnected != isConnected ||
        oldDelegate.isError != isError;
  }
}
