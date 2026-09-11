import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../constants/colors';

const { width } = Dimensions.get('window');

const ROLES = [
  {
    id: 'donor',
    icon: 'heart',
    title: 'Donor',
    desc: 'Donate surplus food from restaurants, events, or home',
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.12)',
    borderColor: 'rgba(34,197,94,0.35)',
  },
  {
    id: 'volunteer',
    icon: 'bicycle',
    title: 'Volunteer',
    desc: 'Pick up food donations and deliver them to NGOs',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.12)',
    borderColor: 'rgba(245,158,11,0.35)',
  },
  {
    id: 'ngo',
    icon: 'business',
    title: 'NGO',
    desc: 'Receive and distribute food to communities in need',
    color: '#3b82f6',
    bgColor: 'rgba(59,130,246,0.12)',
    borderColor: 'rgba(59,130,246,0.35)',
  },
];

const VEHICLE_TYPES = [
  { id: 'two-wheeler', icon: 'bicycle', label: 'Two Wheeler' },
  { id: 'three-wheeler', icon: 'car-sport', label: 'Three Wheeler' },
  { id: 'four-wheeler', icon: 'car', label: 'Four Wheeler' },
  { id: 'van', icon: 'bus', label: 'Van' },
];

const STEPS = ['Role', 'Info', 'Security'];

// ── Animated Input ────────────────────────────────────────────────────────────
function AnimatedInput({ label, icon, placeholder, value, onChangeText,
  secureTextEntry, keyboardType, autoCapitalize, rightElement }) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setFocused(true);
    Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const handleBlur = () => {
    setFocused(false);
    Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inputBorder, COLORS.primary],
  });

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.inputWrap, { borderColor }]}>
        <Ionicons name={icon} size={17} color={focused ? COLORS.primary : COLORS.textMuted} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize !== undefined ? autoCapitalize : 'words'}
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
        {rightElement}
      </Animated.View>
    </View>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(0); // 0 = Role, 1 = Info, 2 = Security
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', role: 'donor',
    organizationName: '', registrationNumber: '',
    vehicleType: 'two-wheeler',
  });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const { register, verifyOTPAndLogin } = useAuth();

  // Animations
  const slideAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const stepContentOp = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Animate progress bar
    Animated.timing(progressAnim, {
      toValue: (step + 1) / STEPS.length,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [step]);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const goNext = () => {
    if (step === 0) {
      // Role step — always valid
    } else if (step === 1) {
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
        Alert.alert('Missing Fields', 'Please fill in Name, Email, and Phone.');
        return;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email.trim())) {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
        return;
      }
    }
    // Slide transition
    Animated.timing(stepContentOp, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep((s) => s + 1);
      Animated.timing(stepContentOp, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const goBack = () => {
    if (step === 0) {
      navigation.goBack();
      return;
    }
    Animated.timing(stepContentOp, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setStep((s) => s - 1);
      Animated.timing(stepContentOp, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  };

  const handleRegister = async () => {
    if (!form.password || form.password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      Alert.alert('Password Mismatch', 'Passwords do not match.');
      return;
    }
    if (form.role === 'ngo' && !form.organizationName.trim()) {
      Alert.alert('Missing Field', 'Please enter your NGO Organization Name.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim(),
        role: form.role,
        organizationName: form.organizationName.trim(),
        registrationNumber: form.registrationNumber.trim() || 'NGO-DEL-2026',
        vehicleType: form.vehicleType,
        location: { type: 'Point', coordinates: [77.209, 28.6139], address: 'New Delhi' },
      };
      const { userData, token, demoOTP } = await register(payload);
      
      // Navigate to OTP verification screen with genuine email OTP
      navigation.navigate('OTPVerify', {
        email: payload.email,
        demoOTP: demoOTP,
        pendingUser: userData,
        token,
      });
    } catch (err) {
      Alert.alert('Registration Failed', err.message || 'Unable to register. Please check your connection and details.');
    } finally {
      setLoading(false);
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const activeRole = ROLES.find((r) => r.id === form.role);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* ── Top Bar ─────────────────────────────────── */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={goBack}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.topBarCenter}>
            <Text style={styles.topBarTitle}>Create Account</Text>
            <Text style={styles.topBarSub}>Step {step + 1} of {STEPS.length} — {STEPS[step]}</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* ── Progress Bar ─────────────────────────────── */}
        <View style={styles.progressBg}>
          <Animated.View style={[styles.progressFill, { width: progressWidth }]} />
        </View>

        {/* ── Step Dots ─────────────────────────────────── */}
        <View style={styles.stepDots}>
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <View style={[styles.dot, i <= step && styles.dotActive]}>
                {i < step ? (
                  <Ionicons name="checkmark" size={11} color="#fff" />
                ) : (
                  <Text style={[styles.dotText, i === step && styles.dotTextActive]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              {i < STEPS.length - 1 && (
                <View style={[styles.dotLine, i < step && styles.dotLineActive]} />
              )}
            </React.Fragment>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: stepContentOp }}>

            {/* ── STEP 0: Role Selection ────────────────── */}
            {step === 0 && (
              <View style={styles.stepWrap}>
                <Text style={styles.stepTitle}>Choose Your Role</Text>
                <Text style={styles.stepSubtitle}>
                  How would you like to contribute to reducing food waste?
                </Text>
                <View style={styles.roleList}>
                  {ROLES.map((role) => {
                    const isActive = form.role === role.id;
                    return (
                      <TouchableOpacity
                        key={role.id}
                        style={[
                          styles.roleCard,
                          { borderColor: isActive ? role.color : COLORS.cardBorder },
                          isActive && { backgroundColor: role.bgColor },
                        ]}
                        onPress={() => set('role', role.id)}
                        activeOpacity={0.8}
                      >
                        <View style={[
                          styles.roleIconBox,
                          { backgroundColor: isActive ? role.bgColor : 'rgba(255,255,255,0.04)' }
                        ]}>
                          <Ionicons
                            name={role.icon}
                            size={28}
                            color={isActive ? role.color : COLORS.textMuted}
                          />
                        </View>
                        <View style={styles.roleInfo}>
                          <Text style={[styles.roleTitle, isActive && { color: role.color }]}>
                            {role.title}
                          </Text>
                          <Text style={styles.roleDesc}>{role.desc}</Text>
                        </View>
                        <View style={[
                          styles.roleCheck,
                          isActive && { backgroundColor: role.color, borderColor: role.color }
                        ]}>
                          {isActive && <Ionicons name="checkmark" size={14} color="#fff" />}
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── STEP 1: Personal Info ─────────────────── */}
            {step === 1 && (
              <View style={styles.stepWrap}>
                <View style={[styles.stepBadge, { backgroundColor: activeRole.bgColor, borderColor: activeRole.borderColor }]}>
                  <Ionicons name={activeRole.icon} size={14} color={activeRole.color} />
                  <Text style={[styles.stepBadgeText, { color: activeRole.color }]}>
                    Registering as {activeRole.title}
                  </Text>
                </View>
                <Text style={styles.stepTitle}>Personal Details</Text>
                <Text style={styles.stepSubtitle}>Tell us a bit about yourself</Text>

                <AnimatedInput
                  label="Full Name *"
                  icon="person-outline"
                  placeholder="e.g. Rahul Sharma"
                  value={form.name}
                  onChangeText={(v) => set('name', v)}
                  autoCapitalize="words"
                />
                <AnimatedInput
                  label="Email Address *"
                  icon="mail-outline"
                  placeholder="rahul@example.com"
                  value={form.email}
                  onChangeText={(v) => set('email', v)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <AnimatedInput
                  label="Phone Number *"
                  icon="call-outline"
                  placeholder="+91 9876543210"
                  value={form.phone}
                  onChangeText={(v) => set('phone', v)}
                  keyboardType="phone-pad"
                  autoCapitalize="none"
                />

                {/* NGO-specific fields on Step 1 */}
                {form.role === 'ngo' && (
                  <>
                    <AnimatedInput
                      label="Organization Name *"
                      icon="business-outline"
                      placeholder="Asha Food Foundation"
                      value={form.organizationName}
                      onChangeText={(v) => set('organizationName', v)}
                    />
                    <AnimatedInput
                      label="Registration Number"
                      icon="document-text-outline"
                      placeholder="NGO-DEL-2026-001"
                      value={form.registrationNumber}
                      onChangeText={(v) => set('registrationNumber', v)}
                      autoCapitalize="characters"
                    />
                  </>
                )}

                {/* Volunteer vehicle type on Step 1 */}
                {form.role === 'volunteer' && (
                  <View style={styles.fieldGroup}>
                    <Text style={styles.label}>Vehicle Type</Text>
                    <View style={styles.vehicleGrid}>
                      {VEHICLE_TYPES.map((v) => {
                        const isActive = form.vehicleType === v.id;
                        return (
                          <TouchableOpacity
                            key={v.id}
                            style={[styles.vehicleCard, isActive && styles.vehicleCardActive]}
                            onPress={() => set('vehicleType', v.id)}
                          >
                            <Ionicons
                              name={v.icon}
                              size={22}
                              color={isActive ? COLORS.primary : COLORS.textMuted}
                            />
                            <Text style={[styles.vehicleLabel, isActive && styles.vehicleLabelActive]}>
                              {v.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}
              </View>
            )}

            {/* ── STEP 2: Security ──────────────────────── */}
            {step === 2 && (
              <View style={styles.stepWrap}>
                <View style={styles.lockIconWrap}>
                  <View style={styles.lockIconBox}>
                    <Ionicons name="shield-checkmark" size={32} color={COLORS.primary} />
                  </View>
                </View>
                <Text style={styles.stepTitle}>Secure Your Account</Text>
                <Text style={styles.stepSubtitle}>
                  Create a strong password to protect your account
                </Text>

                <AnimatedInput
                  label="Password *"
                  icon="lock-closed-outline"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChangeText={(v) => set('password', v)}
                  secureTextEntry={!showPw}
                  autoCapitalize="none"
                  rightElement={
                    <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                      <Ionicons
                        name={showPw ? 'eye-off-outline' : 'eye-outline'}
                        size={17}
                        color={COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  }
                />

                {/* Password strength indicator */}
                {form.password.length > 0 && (
                  <View style={styles.strengthWrap}>
                    {[1, 2, 3, 4].map((n) => (
                      <View
                        key={n}
                        style={[
                          styles.strengthBar,
                          form.password.length >= n * 2 && {
                            backgroundColor: form.password.length >= 8 ? COLORS.primary
                              : form.password.length >= 6 ? COLORS.warning : COLORS.danger,
                          },
                        ]}
                      />
                    ))}
                    <Text style={styles.strengthLabel}>
                      {form.password.length >= 8 ? 'Strong' : form.password.length >= 6 ? 'Medium' : 'Weak'}
                    </Text>
                  </View>
                )}

                <AnimatedInput
                  label="Confirm Password *"
                  icon="lock-open-outline"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChangeText={(v) => set('confirmPassword', v)}
                  secureTextEntry={!showConfirmPw}
                  autoCapitalize="none"
                  rightElement={
                    <TouchableOpacity
                      onPress={() => setShowConfirmPw(!showConfirmPw)}
                      style={styles.eyeBtn}
                    >
                      <Ionicons
                        name={showConfirmPw ? 'eye-off-outline' : 'eye-outline'}
                        size={17}
                        color={COLORS.textMuted}
                      />
                    </TouchableOpacity>
                  }
                />

                {/* Match indicator */}
                {form.confirmPassword.length > 0 && (
                  <View style={styles.matchWrap}>
                    <Ionicons
                      name={form.password === form.confirmPassword ? 'checkmark-circle' : 'close-circle'}
                      size={14}
                      color={form.password === form.confirmPassword ? COLORS.primary : COLORS.danger}
                    />
                    <Text style={[
                      styles.matchText,
                      { color: form.password === form.confirmPassword ? COLORS.primary : COLORS.danger }
                    ]}>
                      {form.password === form.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                    </Text>
                  </View>
                )}

                {/* Terms note */}
                <View style={styles.termsNote}>
                  <Ionicons name="information-circle-outline" size={13} color={COLORS.textMuted} />
                  <Text style={styles.termsText}>
                    By creating an account you agree to our Terms of Service and Privacy Policy.
                  </Text>
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitBtn, loading && { opacity: 0.65 }]}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.85}
                >
                  {loading ? (
                    <Ionicons name="reload-outline" size={20} color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
                      <Text style={styles.submitText}>Create Account & Verify OTP</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* ── Bottom Navigation ─────────────────────────── */}
        {step < 2 && (
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.continueBtn, { backgroundColor: activeRole?.color || COLORS.primaryDark }]}
              onPress={goNext}
              activeOpacity={0.85}
            >
              <Text style={styles.continueBtnText}>
                {step === 0 ? `Continue as ${form.role.charAt(0).toUpperCase() + form.role.slice(1)}` : 'Continue'}
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>

            {step === 0 && (
              <TouchableOpacity
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginLinkText}>
                  Already have an account?{' '}
                  <Text style={{ color: COLORS.primary, fontWeight: '700' }}>Sign In</Text>
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  // Top Bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  topBarCenter: { flex: 1, alignItems: 'center' },
  topBarTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  topBarSub: { color: COLORS.textMuted, fontSize: 11, marginTop: 1 },

  // Progress
  progressBg: {
    height: 3,
    backgroundColor: COLORS.cardBorder,
    marginHorizontal: 16,
    borderRadius: 4,
  },
  progressFill: {
    height: 3,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
  },

  // Step Dots
  stepDots: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 0,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.card,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primary },
  dotText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  dotTextActive: { color: '#fff' },
  dotLine: { width: 40, height: 2, backgroundColor: COLORS.cardBorder },
  dotLineActive: { backgroundColor: COLORS.primary },

  // Scroll content
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 24 },
  stepWrap: { gap: 16 },

  stepBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  stepBadgeText: { fontSize: 11, fontWeight: '700' },
  stepTitle: { color: COLORS.text, fontSize: 24, fontWeight: '900', marginTop: 4 },
  stepSubtitle: { color: COLORS.textMuted, fontSize: 13, lineHeight: 19, marginTop: -4 },

  // Role cards
  roleList: { gap: 10 },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: RADIUS.xl,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
  },
  roleIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleInfo: { flex: 1 },
  roleTitle: { color: COLORS.text, fontSize: 16, fontWeight: '800', marginBottom: 3 },
  roleDesc: { color: COLORS.textMuted, fontSize: 12, lineHeight: 17 },
  roleCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Form fields
  fieldGroup: { gap: 6 },
  label: {
    color: COLORS.textMuted,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    paddingHorizontal: 14,
  },
  input: { flex: 1, color: COLORS.text, fontSize: 14, paddingVertical: 12 },
  eyeBtn: { padding: 4 },

  // Vehicle Grid
  vehicleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  vehicleCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.card,
  },
  vehicleCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  vehicleLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  vehicleLabelActive: { color: COLORS.primary },

  // Lock icon (step 2)
  lockIconWrap: { alignItems: 'center', marginBottom: 4 },
  lockIconBox: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Password strength
  strengthWrap: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: -4 },
  strengthBar: {
    flex: 1,
    height: 3,
    borderRadius: 4,
    backgroundColor: COLORS.cardBorder,
  },
  strengthLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', width: 50 },

  // Password match
  matchWrap: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: -8 },
  matchText: { fontSize: 11, fontWeight: '600' },

  // Terms
  termsNote: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', padding: 12,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: COLORS.cardBorder },
  termsText: { flex: 1, color: COLORS.textMuted, fontSize: 11, lineHeight: 16 },

  // Submit
  submitBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
    ...SHADOW.green,
  },
  submitText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  directBtn: {
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  directBtnText: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },

  // Bottom bar
  bottomBar: {
    padding: 20,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    backgroundColor: COLORS.bg,
  },
  continueBtn: {
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
  },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  loginLink: { alignItems: 'center' },
  loginLinkText: { color: COLORS.textMuted, fontSize: 13 },
});
