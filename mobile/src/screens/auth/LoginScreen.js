import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../constants/colors';
import { HOST } from '../../constants/api';

// ── Animated Input Field ─────────────────────────────────────────────────────
function AnimatedInput({
  label, icon, placeholder, value, onChangeText,
  secureTextEntry, keyboardType, autoCapitalize,
  rightElement, hint,
}) {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  const onFocus = () => {
    setFocused(true);
    Animated.timing(borderAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  };
  const onBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [COLORS.inputBorder, COLORS.primary],
  });

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.inputWrap, { borderColor }]}>
        <Ionicons
          name={icon}
          size={18}
          color={focused ? COLORS.primary : COLORS.textMuted}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || 'default'}
          autoCapitalize={autoCapitalize || 'none'}
          onFocus={onFocus}
          onBlur={onBlur}
        />
        {rightElement}
      </Animated.View>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // Entrance animations
  const headerY = useRef(new Animated.Value(-30)).current;
  const headerOp = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(40)).current;
  const cardOp = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.stagger(100, [
      Animated.parallel([
        Animated.timing(headerY, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(headerOp, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardY, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cardOp, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    // Subtle glow pulse loop
    const pulse = () => {
      Animated.sequence([
        Animated.timing(glowPulse, { toValue: 1.15, duration: 2200, useNativeDriver: true }),
        Animated.timing(glowPulse, { toValue: 0.85, duration: 2200, useNativeDriver: true }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Required Fields', 'Please enter both email address and password to sign in.');
      return;
    }
    setLoading(true);
    try {
      await login({ email: email.trim().toLowerCase(), password });
      // Navigation is handled automatically by RootNavigator based on real user role
    } catch (err) {
      Alert.alert(
        'Sign In Failed',
        err.message || 'Invalid email or password. Please verify credentials or ensure the server is active at ' + HOST
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ─────────────────────────────────── */}
          <Animated.View
            style={[styles.header, { opacity: headerOp, transform: [{ translateY: headerY }] }]}
          >
            <View style={styles.logoWrap}>
              <Animated.View style={[styles.glowRing, { transform: [{ scale: glowPulse }] }]} />
              <View style={styles.logoBox}>
                <Ionicons name="leaf" size={40} color="#fff" />
              </View>
            </View>
            <Text style={styles.appName}>AnnSetu</Text>
            <Text style={styles.tagline}>AI-Powered Food Rescue & Distribution</Text>

            {/* Server connection chip */}
            <View style={styles.serverChip}>
              <View style={styles.serverDot} />
              <Text style={styles.serverText}>API: {HOST.replace('http://', '')}</Text>
            </View>
          </Animated.View>

          {/* ── Sign In Card ───────────────────────────── */}
          <Animated.View
            style={[styles.card, { opacity: cardOp, transform: [{ translateY: cardY }] }]}
          >
            <View style={styles.cardHeaderStrip}>
              <Ionicons name="shield-checkmark" size={22} color={COLORS.primary} />
              <Text style={styles.cardTitle}>Account Sign In</Text>
            </View>
            <Text style={styles.cardSub}>Enter your registered email and password</Text>

            <AnimatedInput
              label="Email Address"
              icon="mail-outline"
              placeholder="you@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <AnimatedInput
              label="Password"
              icon="lock-closed-outline"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              rightElement={
                <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                  <Ionicons
                    name={showPw ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              }
            />

            {/* Forgot Password */}
            <TouchableOpacity
              style={styles.forgotWrap}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.signInBtn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="log-in-outline" size={20} color="#fff" />
                  <Text style={styles.signInText}>Sign In</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Register Link */}
            <TouchableOpacity
              style={styles.registerRow}
              onPress={() => navigation.navigate('Register')}
            >
              <Text style={styles.registerText}>Don't have an account?</Text>
              <View style={styles.registerPill}>
                <Text style={styles.registerPillText}>Create Account</Text>
                <Ionicons name="arrow-forward" size={12} color={COLORS.primary} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Security footnote */}
          <View style={styles.securityFootnote}>
            <Ionicons name="lock-closed" size={13} color={COLORS.textMuted} />
            <Text style={styles.securityText}>
              256-Bit Encrypted & Protected by AnnSetu Cloud Security
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 32, gap: 16, justifyContent: 'center' },

  // Header
  header: { alignItems: 'center', paddingTop: 10, gap: 6 },
  logoWrap: { alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  glowRing: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.primary,
    opacity: 0.18,
  },
  logoBox: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.green,
  },
  appName: { color: COLORS.text, fontSize: 32, fontWeight: '900', letterSpacing: 1 },
  tagline: { color: COLORS.textMuted, fontSize: 13 },
  serverChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginTop: 4,
  },
  serverDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary },
  serverText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },

  // Sign In Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xxl,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 14,
    ...SHADOW.card,
  },
  cardHeaderStrip: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardTitle: { color: COLORS.text, fontSize: 21, fontWeight: '800' },
  cardSub: { color: COLORS.textMuted, fontSize: 13, marginTop: -6 },

  // Form fields
  fieldGroup: { gap: 5 },
  label: {
    color: COLORS.textMuted,
    fontSize: 11,
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
  input: { flex: 1, color: COLORS.text, fontSize: 15, paddingVertical: 12 },
  hint: { color: COLORS.placeholder, fontSize: 10, marginTop: 2 },
  eyeBtn: { padding: 4 },

  forgotWrap: { alignSelf: 'flex-end', marginTop: -4 },
  forgotText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },

  // Sign In Button
  signInBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
    ...SHADOW.green,
    marginTop: 6,
  },
  btnDisabled: { opacity: 0.6 },
  signInText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 4 },
  dividerLine: { flex: 1, height: 1, backgroundColor: COLORS.cardBorder },
  dividerText: { color: COLORS.textMuted, fontSize: 12 },

  // Register link
  registerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  registerText: { color: COLORS.textMuted, fontSize: 13 },
  registerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
  },
  registerPillText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },

  // Security footnote
  securityFootnote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 4,
  },
  securityText: { color: COLORS.textMuted, fontSize: 11, textAlign: 'center' },
});
