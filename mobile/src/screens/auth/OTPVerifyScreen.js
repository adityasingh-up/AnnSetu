import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert,
  Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../constants/colors';

const { width } = Dimensions.get('window');
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60; // seconds

export default function OTPVerifyScreen({ navigation, route }) {
  const {
    email = 'user@annsetu.org',
    demoOTP = '123456',
    pendingUser,
    token,
  } = route.params || {};

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);
  const { verifyOTPAndLogin, authApi } = useAuth();

  // Animations
  const shieldScale = useRef(new Animated.Value(0)).current;
  const shieldOp = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(40)).current;
  const cardOp = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const successOp = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(shieldScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(shieldOp, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(cardY, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(cardOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Ring rotation loop
    const rotate = () => {
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 6000,
        useNativeDriver: true,
      }).start(() => {
        ringRotate.setValue(0);
        rotate();
      });
    };
    rotate();

    // Auto-fill demo OTP
    if (demoOTP) {
      const digits = demoOTP.slice(0, OTP_LENGTH).split('');
      while (digits.length < OTP_LENGTH) digits.push('');
      setOtp(digits);
    }

    // Resend countdown
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { setCanResend(true); clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const spin = ringRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleChange = (text, index) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    // Auto-submit when all filled
    if (digit && index === OTP_LENGTH - 1) {
      const allFilled = newOtp.every((d) => d !== '');
      if (allFilled) {
        setTimeout(() => handleVerify(newOtp.join('')), 200);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  const handleVerify = async (code) => {
    const otpCode = code || otp.join('');
    if (otpCode.length < OTP_LENGTH) {
      shake();
      Alert.alert('Incomplete OTP', 'Please enter all 6 digits.');
      return;
    }
    setLoading(true);
    try {
      await verifyOTPAndLogin({
        email,
        otp: otpCode,
        pendingUser: pendingUser || {
          _id: `user_${Date.now()}`,
          name: email.split('@')[0],
          email,
          role: pendingUser?.role || 'donor',
          isEmailVerified: true,
        },
        token,
      });

      // Success animation
      setSuccess(true);
      Animated.parallel([
        Animated.spring(successScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(successOp, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]).start();
    } catch (err) {
      shake();
      Alert.alert('Verification Error', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    try {
      await authApi?.resendOTP?.({ email });
    } catch (_) {}
    setCanResend(false);
    setResendTimer(RESEND_COOLDOWN);
    Alert.alert('OTP Sent', `A new OTP has been sent to ${email}`);
    // Restart countdown
    const interval = setInterval(() => {
      setResendTimer((t) => {
        if (t <= 1) { setCanResend(true); clearInterval(interval); return 0; }
        return t - 1;
      });
    }, 1000);
  };

  const handleAutoFill = () => {
    const digits = demoOTP.slice(0, OTP_LENGTH).split('');
    setOtp(digits);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* ── Animated Shield ─────────────────────────── */}
        <Animated.View
          style={[styles.shieldWrap, { opacity: shieldOp, transform: [{ scale: shieldScale }] }]}
        >
          {/* Rotating ring */}
          <Animated.View style={[styles.spinRing, { transform: [{ rotate: spin }] }]} />
          <View style={styles.shieldBox}>
            <Ionicons name="shield-checkmark" size={44} color={COLORS.primary} />
          </View>
        </Animated.View>

        {/* ── Title ───────────────────────────────────── */}
        <Text style={styles.title}>Verify Your Account</Text>
        <Text style={styles.sub}>
          Enter the 6-digit code sent to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        {/* ── Demo OTP Banner ─────────────────────────── */}
        {demoOTP && (
          <TouchableOpacity style={styles.demoBanner} onPress={handleAutoFill} activeOpacity={0.8}>
            <Ionicons name="sparkles" size={16} color={COLORS.warning} />
            <View style={{ flex: 1 }}>
              <Text style={styles.demoLabel}>Demo OTP — tap to auto-fill</Text>
              <Text style={styles.demoCode}>{demoOTP}</Text>
            </View>
            <View style={styles.fillBtn}>
              <Text style={styles.fillBtnText}>Fill</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* ── 6-Box OTP Input ─────────────────────────── */}
        <Animated.View
          style={[
            styles.otpRow,
            { opacity: cardOp, transform: [{ translateY: cardY }, { translateX: shakeAnim }] },
          ]}
        >
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputRefs.current[i] = ref; }}
              style={[
                styles.otpBox,
                digit && styles.otpBoxFilled,
                i === otp.findLastIndex((d) => d !== '') + 1 && !otp[i] && styles.otpBoxActive,
              ]}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              textAlign="center"
              caretHidden
              selectTextOnFocus
            />
          ))}
        </Animated.View>

        {/* ── Verify Button ───────────────────────────── */}
        <TouchableOpacity
          style={[styles.verifyBtn, loading && { opacity: 0.65 }]}
          onPress={() => handleVerify()}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <Ionicons name="reload-outline" size={20} color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.verifyBtnText}>Verify & Open App</Text>
            </>
          )}
        </TouchableOpacity>

        {/* ── Resend ──────────────────────────────────── */}
        <View style={styles.resendRow}>
          <Text style={styles.resendLabel}>Didn't receive the code?</Text>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendActive}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendTimer}>Resend in {resendTimer}s</Text>
          )}
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 8 }}>
          <Text style={styles.backText}>← Back to Sign In</Text>
        </TouchableOpacity>

        {/* ── Success Overlay ─────────────────────────── */}
        {success && (
          <Animated.View
            style={[
              styles.successOverlay,
              { opacity: successOp, transform: [{ scale: successScale }] },
            ]}
          >
            <View style={styles.successBox}>
              <View style={styles.successIconBox}>
                <Ionicons name="checkmark-circle" size={64} color={COLORS.primary} />
              </View>
              <Text style={styles.successTitle}>Verified! 🎉</Text>
              <Text style={styles.successSub}>Opening your dashboard...</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 20,
    alignItems: 'center',
    gap: 18,
  },

  // Shield
  shieldWrap: { position: 'relative', width: 110, height: 110, alignItems: 'center', justifyContent: 'center' },
  spinRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    opacity: 0.4,
  },
  shieldBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text
  title: { color: COLORS.text, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  sub: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20, marginTop: -8 },
  email: { color: COLORS.primary, fontWeight: '700' },

  // Demo banner
  demoBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(245,158,11,0.1)',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    padding: 12,
  },
  demoLabel: { color: COLORS.warning, fontSize: 11, fontWeight: '700' },
  demoCode: { color: COLORS.warning, fontSize: 22, fontWeight: '900', letterSpacing: 4, marginTop: 2 },
  fillBtn: {
    backgroundColor: 'rgba(245,158,11,0.25)',
    borderRadius: RADIUS.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  fillBtnText: { color: COLORS.warning, fontSize: 11, fontWeight: '800' },

  // 6-box OTP
  otpRow: { flexDirection: 'row', gap: 8, width: '100%', justifyContent: 'center' },
  otpBox: {
    width: (width - 56 - 8 * 5) / 6,
    height: (width - 56 - 8 * 5) / 6,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.inputBorder,
    backgroundColor: COLORS.inputBg,
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
  },
  otpBoxFilled: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(34,197,94,0.1)',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  otpBoxActive: {
    borderColor: 'rgba(34,197,94,0.5)',
  },

  // Verify button
  verifyBtn: {
    width: '100%',
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    gap: 8,
    ...SHADOW.green,
  },
  verifyBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  // Resend
  resendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  resendLabel: { color: COLORS.textMuted, fontSize: 12 },
  resendActive: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  resendTimer: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },

  // Skip
  skipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34,197,94,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
    borderRadius: RADIUS.lg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '100%',
    justifyContent: 'center',
  },
  skipText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  backText: { color: COLORS.textMuted, fontSize: 13, marginTop: -4 },

  // Success overlay
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,15,23,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successBox: { alignItems: 'center', gap: 14 },
  successIconBox: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(34,197,94,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.3)',
  },
  successTitle: { color: COLORS.text, fontSize: 32, fontWeight: '900' },
  successSub: { color: COLORS.textMuted, fontSize: 14 },
});
