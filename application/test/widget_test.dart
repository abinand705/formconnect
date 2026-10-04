import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:formconnect_app/main.dart';
import 'package:formconnect_app/providers/auth_provider.dart';
import 'package:formconnect_app/screens/settings/server_config_dialog.dart';
import 'package:formconnect_app/services/storage_service.dart';
import 'package:formconnect_app/widgets/server_loading_animation.dart';
import 'package:provider/provider.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  setUp(() async {
    SharedPreferences.setMockInitialValues({});
    await StorageService.init();
  });

  testWidgets('ServerLoadingAnimation renders in all states', (WidgetTester tester) async {
    for (final state in ServerLoadingState.values) {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ServerLoadingAnimation(state: state, size: 120),
          ),
        ),
      );
      await tester.pump();
      expect(find.byType(ServerLoadingAnimation), findsOneWidget);
    }
  });

  testWidgets('ServerConfigDialog does not overflow when keyboard is open', (WidgetTester tester) async {
    // Set a small viewport simulating keyboard occupying screen (e.g. 360 x 340)
    tester.view.physicalSize = const Size(360, 340);
    tester.view.devicePixelRatio = 1.0;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(
      ChangeNotifierProvider<AuthProvider>(
        create: (_) => AuthProvider(),
        child: const MaterialApp(
          home: Scaffold(
            body: ServerConfigDialog(),
          ),
        ),
      ),
    );
    await tester.pump();

    // Verify dialog and scrollable content render without any RenderFlex overflow
    expect(find.byType(ServerConfigDialog), findsOneWidget);
    expect(find.byType(SingleChildScrollView), findsOneWidget);
  });

  testWidgets('FormConnectApp smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(
      const FormConnectApp(),
    );
    await tester.pump();
    expect(find.byType(FormConnectApp), findsOneWidget);

    // Dispose to cancel any active timers
    await tester.pumpWidget(const SizedBox.shrink());
    await tester.pump();
  });
}
