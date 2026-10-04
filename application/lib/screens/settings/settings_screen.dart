import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/auth_provider.dart';
import '../../theme/app_theme.dart';
import '../../widgets/app_button.dart';
import '../../widgets/app_text_field.dart';
import '../../widgets/custom_toast.dart';
import '../auth/login_screen.dart';
import '../server_loading_screen.dart';
import 'server_config_dialog.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  Future<void> _showChangePasswordDialog() async {
    final currentPassCtrl = TextEditingController();
    final newPassCtrl = TextEditingController();
    final confirmPassCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool isSubmitting = false;

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Change Password', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  AppTextField(
                    controller: currentPassCtrl,
                    label: 'Current Password',
                    obscureText: true,
                    validator: (val) => val == null || val.isEmpty ? 'Required' : null,
                  ),
                  const SizedBox(height: 12),
                  AppTextField(
                    controller: newPassCtrl,
                    label: 'New Password',
                    obscureText: true,
                    validator: (val) => val != null && val.length >= 6 ? null : 'Min 6 characters',
                  ),
                  const SizedBox(height: 12),
                  AppTextField(
                    controller: confirmPassCtrl,
                    label: 'Confirm New Password',
                    obscureText: true,
                    validator: (val) => val == newPassCtrl.text ? null : 'Passwords do not match',
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            AppButton(
              text: 'Update Password',
              isLoading: isSubmitting,
              height: 40,
              onPressed: () async {
                if (!formKey.currentState!.validate()) return;
                setDialogState(() => isSubmitting = true);
                final auth = context.read<AuthProvider>();
                final success = await auth.changePassword(
                  currentPassCtrl.text,
                  newPassCtrl.text,
                );
                if (!ctx.mounted || !mounted) return;
                setDialogState(() => isSubmitting = false);
                if (success) {
                  Navigator.of(ctx).pop();
                  CustomToast.showSuccess(context, 'Password updated successfully');
                } else {
                  CustomToast.showError(ctx, auth.errorMessage ?? 'Failed to update password');
                }
              },
            ),
          ],
        ),
      ),
    );

    currentPassCtrl.dispose();
    newPassCtrl.dispose();
    confirmPassCtrl.dispose();
  }

  Future<void> _showDeleteAccountDialog() async {
    final passCtrl = TextEditingController();
    bool isSubmitting = false;

    await showDialog(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setDialogState) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: const Text('Delete Account', style: TextStyle(color: AppColors.danger, fontWeight: FontWeight.w700)),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'This will permanently delete your account, projects, and all submissions. Enter your password to confirm.',
                  style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 14),
                AppTextField(
                  controller: passCtrl,
                  label: 'Password',
                  obscureText: true,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(ctx).pop(),
              child: const Text('Cancel'),
            ),
            AppButton(
              text: 'Delete Account',
              variant: AppButtonVariant.danger,
              isLoading: isSubmitting,
              height: 40,
              onPressed: () async {
                if (passCtrl.text.isEmpty) return;
                setDialogState(() => isSubmitting = true);
                final auth = context.read<AuthProvider>();
                final success = await auth.deleteAccount(passCtrl.text);
                if (!ctx.mounted || !mounted) return;
                setDialogState(() => isSubmitting = false);
                if (success) {
                  Navigator.of(ctx).pop();
                  Navigator.of(context).pushAndRemoveUntil(
                    MaterialPageRoute(builder: (_) => const LoginScreen()),
                    (route) => false,
                  );
                } else {
                  CustomToast.showError(ctx, auth.errorMessage ?? 'Failed to delete account');
                }
              },
            ),
          ],
        ),
      ),
    );

    passCtrl.dispose();
  }

  Future<void> _handleLogout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Sign Out?'),
        content: const Text('Are you sure you want to sign out of FormConnect?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(ctx).pop(false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: AppColors.primaryForest),
            onPressed: () => Navigator.of(ctx).pop(true),
            child: const Text('Sign Out', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true || !mounted) return;

    await context.read<AuthProvider>().logout();
    if (!mounted) return;

    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;

    return Scaffold(
      backgroundColor: AppColors.bgPage,
      appBar: AppBar(
        title: const Text('Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Account Profile Card
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: AppColors.primaryForest,
                  child: Text(
                    (user?.email.isNotEmpty == true ? user!.email[0] : 'U').toUpperCase(),
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.email ?? 'Unknown User',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'User ID: ${user?.id.isNotEmpty == true ? user!.id.substring(0, 12) : 'Active'}...',
                        style: const TextStyle(fontSize: 11, color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Server Connection Card
          _buildSectionHeader('Backend & Server Connection'),
          Container(
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  leading: const Icon(Icons.dns_rounded, color: AppColors.primaryForest),
                  title: const Text('API Endpoint', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  subtitle: Text(
                    auth.baseUrl,
                    style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                  ),
                  trailing: const Icon(Icons.chevron_right, size: 20),
                  onTap: () => ServerConfigDialog.show(context),
                ),
                const Divider(height: 1),
                ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                  leading: Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: AppColors.accentMint.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.bolt_rounded, color: AppColors.accentMint, size: 20),
                  ),
                  title: const Text('Server Loading & Wake-Up Screen', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  subtitle: const Text('Monitor server readiness, pulse test, and wake up cloud instances', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  trailing: const Icon(Icons.chevron_right, size: 20),
                  onTap: () => ServerLoadingScreen.showAsDialog(context),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Security Section
          _buildSectionHeader('Account & Security'),
          Container(
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.lock_outline_rounded, color: AppColors.primaryForest),
                  title: const Text('Change Password', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
                  trailing: const Icon(Icons.chevron_right, size: 20),
                  onTap: _showChangePasswordDialog,
                ),
                const Divider(height: 1),
                ListTile(
                  leading: const Icon(Icons.delete_forever_rounded, color: AppColors.danger),
                  title: const Text('Delete Account', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.danger)),
                  trailing: const Icon(Icons.chevron_right, size: 20),
                  onTap: _showDeleteAccountDialog,
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // About FormConnect
          _buildSectionHeader('About'),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.bgCard,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: AppColors.border),
            ),
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('FormConnect Mobile', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w700)),
                    Text('v1.0.0 (Production)', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  ],
                ),
                SizedBox(height: 6),
                Text(
                  'Your own contact-form backend. Multi-tenant infrastructure for personal and portfolio projects.',
                  style: TextStyle(fontSize: 12, color: AppColors.textMuted, height: 1.4),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Logout Button
          AppButton(
            text: 'Sign Out',
            variant: AppButtonVariant.outline,
            icon: Icons.logout_rounded,
            onPressed: _handleLogout,
            height: 48,
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4, bottom: 8),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.w700,
          color: AppColors.textSecondary,
        ),
      ),
    );
  }
}
