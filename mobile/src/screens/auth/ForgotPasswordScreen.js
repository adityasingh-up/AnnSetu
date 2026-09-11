import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { authApi } from '../../api/authApi';
import { COLORS, RADIUS } from '../../constants/colors';

export default function ForgotPasswordScreen({ navigation }) {
  // Step 1 state
  const [email, setEmail] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);

  // Step 2 state
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpFocused, setOtpFocused] = useState(false);
  const [newPassFocused, setNewPassFocused] = useState(false);
  const [confirmPassFocused, setConfirmPassFocused] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Flow state
  const [step, setStep] = useState(1); // 1 = email, 2 = OTP + new password, 3 = success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoOtp, setDemoOtp] = useState(''); // shown in dev mode

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;

  const animateToNextStep = () => {
    Animated.sequence([
      Animated.timing(slideAnim, { toValue: -20, duration: 150, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]).start();
  };

  // Step 1: Send OTP to email
  const handleSendOTP = async () => {
    setError('');
    if (!email.trim()) {
      setError('Please enter your registered email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email: email.trim().toLowerCase() });
      // Backend returns demoOTP in dev mode
      const demo = res?.data?.demoOTP;
      if (demo) setDemoOtp(demo);
      animateToNextStep();
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please check your email and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP + Reset Password
  const handleResetPassword = async () => {
    setError('');

    if (!otp.trim() || otp.trim().length !== 6) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter both fields carefully.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        newPassword,
      });
      animateToNextStep();
      setStep(3);
    } catch (err) {
      setError(err.message || 'Password reset failed. Please verify OTP and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => step === 2 ? setStep(1) : navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Animated.View style={[styles.inner, { transform: [{ translateX: slideAnim }] }]}>

              {/* ─── STEP 1: Email Input ─── */}
              {step === 1 && (
                <View style={styles.formWrap}>
                  <View style={styles.iconBox}>
                    <Ionicons name="key-outline" size={36} color={COLORS.primary} />
                  </View>
                  <Text style={styles.title}>Forgot Password?</Text>
                  <Text style={styles.subtitle}>
                    Enter your registered email address. We'll send you a 6-digit OTP code to reset your password.
                  </Text>

                  {/* Error */}
                  {error ? (
                    <View style={styles.errorBox}>
                      <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  {/* Email Field */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Registered Email Address</Text>
                    <View style={[styles.inputWrap, emailFocused && styles.inputWrapFocused]}>
                      <Ionicons
                        name="mail-outline"
                        size={18}
                        color={emailFocused ? COLORS.primary : COLORS.textMuted}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor={COLORS.placeholder}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        value={email}
                        onChangeText={setEmail}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                      />
                    </View>
                  </View>

                  {/* Send OTP Button */}
                  <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.65 }]}
                    onPress={handleSendOTP}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <Ionicons name="reload-outline" size={20} color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="send" size={18} color="#fff" />
                        <Text style={styles.submitText}>Send Reset OTP</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backToLogin}
                    onPress={() => navigation.navigate('Login')}
                  >
                    <Ionicons name="arrow-back-circle-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.backToLoginText}>Back to Sign In</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ─── STEP 2: OTP + New Password ─── */}
              {step === 2 && (
                <View style={styles.formWrap}>
                  <View style={styles.iconBox}>
                    <Ionicons name="shield-checkmark-outline" size={36} color={COLORS.primary} />
                  </View>
                  <Text style={styles.title}>Reset Password</Text>
                  <Text style={styles.subtitle}>
                    Check your inbox at{' '}
                    <Text style={{ color: COLORS.primary, fontWeight: '700' }}>{email}</Text>
                    {' '}for the 6-digit OTP code.
                  </Text>

                  {/* Demo OTP hint (dev mode) */}
                  {demoOtp ? (
                    <View style={styles.demoOtpBox}>
                      <Ionicons name="information-circle-outline" size={16} color={COLORS.warning} />
                      <Text style={styles.demoOtpText}>
                        Dev OTP: <Text style={{ fontWeight: '900', letterSpacing: 2 }}>{demoOtp}</Text>
                      </Text>
                    </View>
                  ) : null}

                  {/* Error */}
                  {error ? (
                    <View style={styles.errorBox}>
                      <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  {/* OTP Input */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>6-Digit OTP Code</Text>
                    <View style={[styles.inputWrap, styles.otpInputWrap, otpFocused && styles.inputWrapFocused]}>
                      <Ionicons
                        name="keypad-outline"
                        size={18}
                        color={otpFocused ? COLORS.primary : COLORS.textMuted}
                      />
                      <TextInput
                        style={[styles.input, styles.otpInput]}
                        placeholder="• • • • • •"
                        placeholderTextColor={COLORS.placeholder}
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otp}
                        onChangeText={setOtp}
                        onFocus={() => setOtpFocused(true)}
                        onBlur={() => setOtpFocused(false)}
                      />
                    </View>
                  </View>

                  {/* New Password */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={[styles.inputWrap, newPassFocused && styles.inputWrapFocused]}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color={newPassFocused ? COLORS.primary : COLORS.textMuted}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Min. 6 characters"
                        placeholderTextColor={COLORS.placeholder}
                        secureTextEntry={!showNewPassword}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        onFocus={() => setNewPassFocused(true)}
                        onBlur={() => setNewPassFocused(false)}
                      />
                      <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)}>
                        <Ionicons
                          name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color={COLORS.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Confirm New Password</Text>
                    <View style={[styles.inputWrap, confirmPassFocused && styles.inputWrapFocused]}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={18}
                        color={confirmPassFocused ? COLORS.primary : COLORS.textMuted}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="Re-enter new password"
                        placeholderTextColor={COLORS.placeholder}
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        onFocus={() => setConfirmPassFocused(true)}
                        onBlur={() => setConfirmPassFocused(false)}
                      />
                      <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Ionicons
                          name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                          size={18}
                          color={COLORS.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                    {/* Password match indicator */}
                    {confirmPassword.length > 0 && (
                      <Text style={[styles.matchHint, { color: newPassword === confirmPassword ? COLORS.primary : COLORS.danger }]}>
                        {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                      </Text>
                    )}
                  </View>

                  {/* Reset Button */}
                  <TouchableOpacity
                    style={[styles.submitBtn, loading && { opacity: 0.65 }]}
                    onPress={handleResetPassword}
                    disabled={loading}
                    activeOpacity={0.85}
                  >
                    {loading ? (
                      <Ionicons name="reload-outline" size={20} color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
                        <Text style={styles.submitText}>Reset & Save Password</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.backToLogin}
                    onPress={() => { setStep(1); setError(''); setOtp(''); setNewPassword(''); setConfirmPassword(''); }}
                  >
                    <Ionicons name="arrow-back-circle-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.backToLoginText}>Change Email Address</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ─── STEP 3: Success ─── */}
              {step === 3 && (
                <View style={styles.successWrap}>
                  <View style={styles.successIconBox}>
                    <Ionicons name="checkmark-circle" size={64} color={COLORS.primary} />
                  </View>
                  <Text style={styles.successTitle}>Password Reset!</Text>
                  <Text style={styles.successSub}>
                    Your password has been updated successfully.{'\n\n'}
                    You can now sign in with your new password.
                  </Text>

                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={() => navigation.navigate('Login')}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="log-in-outline" size={18} color="#fff" />
                    <Text style={styles.submitText}>Sign In Now</Text>
                  </TouchableOpacity>
                </View>
              )}

            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  backBtn: {
    margin: 16,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  scrollContent: { flexGrow: 1 },
  inner: { flex: 1, paddingHorizontal: 24, paddingBottom: 32 },
  formWrap: { gap: 16, paddingTop: 8 },

  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  title: { color: COLORS.text, fontSize: 26, fontWeight: '900', letterSpacing: 0.3 },
  subtitle: { color: COLORS.textMuted, fontSize: 13, lineHeight: 20 },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  errorText: { color: COLORS.danger, fontSize: 12, fontWeight: '600', flex: 1 },

  demoOtpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  demoOtpText: { color: COLORS.warning, fontSize: 12, fontWeight: '600' },

  fieldGroup: { gap: 6 },
  label: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: 14,
    paddingVertical: 2,
  },
  inputWrapFocused: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  otpInputWrap: { justifyContent: 'center' },
  input: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 13 },
  otpInput: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 6,
    fontVariant: ['tabular-nums'],
  },
  matchHint: { fontSize: 11, fontWeight: '600', marginTop: 2 },

  submitBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    marginTop: 4,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
    paddingBottom: 8,
  },
  backToLoginText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  successWrap: { alignItems: 'center', gap: 16, paddingVertical: 40, paddingHorizontal: 24 },
  successIconBox: {
    width: 110,
    height: 110,
    borderRadius: 34,
    backgroundColor: 'rgba(34,197,94,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    marginBottom: 8,
  },
  successTitle: { color: COLORS.text, fontSize: 28, fontWeight: '900' },
  successSub: { color: COLORS.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
