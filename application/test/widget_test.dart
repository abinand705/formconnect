import 'package:flutter_test/flutter_test.dart';
import 'package:formconnect_app/main.dart';
import 'package:shared_preferences/shared_preferences.dart';

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('FormConnectApp smoke test', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    await tester.pumpWidget(const FormConnectApp());
    // Advance time past the splash delay and animations
    await tester.pump(const Duration(milliseconds: 2000));
    await tester.pumpAndSettle();

    expect(find.byType(FormConnectApp), findsOneWidget);
  });
}
