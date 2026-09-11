import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');

const ROLES = [
  {
    icon: 'heart',
    title: 'Donor',
    desc: 'Donate surplus food & save lives',
    color: '#22c55e',
    bgColor: 'rgba(34,197,94,0.12)',
  },
  {
    icon: 'bicycle',
    title: 'Volunteer',
    desc: 'Pick up & deliver food donations',
    color: '#f59e0b',
    bgColor: 'rgba(245,158,11,0.12)',
  },
  {
    icon: 'business',
    title: 'NGO',
    desc: 'Receive & distribute to communities',
    color: '#3b82f6',
    bgColor: 'rgba(59,130,246,0.12)',
  },
];

// Floating orb particle component
function FloatingOrb({ style, delay, color }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 3000 + delay,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 3000 + delay,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };
    const timer = setTimeout(animate, delay);
    return () => clearTimeout(timer);
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const opacity = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.15, 0.35, 0.15] });

  return (
    <Animated.View
      style={[
        styles.orb,
        style,
        { transform: [{ translateY }], opacity, backgroundColor: color || COLORS.primary },
      ]}
    />
  );
}

export default function SplashScreen({ navigation }) {
  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const cardsY = useRef(new Animated.Value(50)).current;
  const cardsOpacity = useRef(new Animated.Value(0)).current;
  const btnOpacity = useRef(new Animated.Value(0)).current;
  const btnScale = useRef(new Animated.Value(0.9)).current;
  const [activeRole, setActiveRole] = useState(0);

  useEffect(() => {
    // Sequence of entrance animations
    Animated.sequence([
      // Logo entrance
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      // Title slide up
      Animated.parallel([
        Animated.timing(titleY, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      // Role cards
      Animated.parallel([
        Animated.timing(cardsY, { toValue: 0, duration: 600, useNativeDriver: true }),
        Animated.timing(cardsOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
      // Button
      Animated.parallel([
        Animated.timing(btnOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(btnScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      ]),
    ]).start();

    // Logo glow pulse loop
    const glow = () => {
      Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0.5, duration: 1800, useNativeDriver: true }),
      ]).start(() => glow());
    };
    const glowTimer = setTimeout(glow, 800);

    // Cycle through role cards
    const interval = setInterval(() => {
      setActiveRole((prev) => (prev + 1) % 3);
    }, 1800);

    // Auto-navigate after 5 seconds
    const navTimer = setTimeout(() => navigation.replace('Login'), 5000);

    return () => {
      clearTimeout(glowTimer);
      clearTimeout(navTimer);
      clearInterval(interval);
    };
  }, []);

  const glowScale = glowAnim.interpolate({ inputRange: [0.5, 1], outputRange: [1, 1.18] });
  const glowOpacity = glowAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.2, 0.5] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* Floating background orbs */}
      <FloatingOrb style={{ top: height * 0.08, left: width * 0.1, width: 120, height: 120 }} delay={0} color="#22c55e" />
      <FloatingOrb style={{ top: height * 0.18, right: width * 0.05, width: 80, height: 80 }} delay={700} color="#3b82f6" />
      <FloatingOrb style={{ top: height * 0.55, left: -20, width: 100, height: 100 }} delay={400} color="#22c55e" />
      <FloatingOrb style={{ bottom: height * 0.2, right: width * 0.08, width: 60, height: 60 }} delay={1000} color="#f59e0b" />
      <FloatingOrb style={{ bottom: height * 0.05, left: width * 0.25, width: 140, height: 140 }} delay={200} color="#22c55e" />

      <SafeAreaView style={styles.safe}>
        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View
            style={{ alignItems: 'center', opacity: logoOpacity, transform: [{ scale: logoScale }] }}
          >
            {/* Glow ring behind logo */}
            <Animated.View
              style={[
                styles.glowRing,
                { transform: [{ scale: glowScale }], opacity: glowOpacity },
              ]}
            />
            <View style={styles.logoBox}>
              <Ionicons name="leaf" size={44} color="#fff" />
            </View>
          </Animated.View>

          {/* App Name & Tagline */}
          <Animated.View
            style={{
              alignItems: 'center',
              marginTop: 20,
              opacity: titleOpacity,
              transform: [{ translateY: titleY }],
            }}
          >
            <Text style={styles.appName}>AnnSetu</Text>
            <View style={styles.taglinePill}>
              <Ionicons name="sparkles" size={11} color={COLORS.primary} />
              <Text style={styles.taglineText}>AI-Powered Food Rescue & Distribution</Text>
            </View>
          </Animated.View>

          {/* Role Cards */}
          <Animated.View
            style={[
              styles.rolesContainer,
              { opacity: cardsOpacity, transform: [{ translateY: cardsY }] },
            ]}
          >
            <Text style={styles.rolesLabel}>Join as</Text>
            <View style={styles.rolesRow}>
              {ROLES.map((role, idx) => (
                <View
                  key={role.title}
                  style={[
                    styles.roleCard,
                    {
                      backgroundColor: role.bgColor,
                      borderColor: activeRole === idx ? role.color : 'rgba(255,255,255,0.08)',
                      borderWidth: activeRole === idx ? 1.5 : 1,
                      transform: [{ scale: activeRole === idx ? 1.04 : 1 }],
                    },
                  ]}
                >
                  <View style={[styles.roleIconCircle, { backgroundColor: role.bgColor }]}>
                    <Ionicons name={role.icon} size={22} color={role.color} />
                  </View>
                  <Text style={[styles.roleTitle, { color: role.color }]}>{role.title}</Text>
                  <Text style={styles.roleDesc}>{role.desc}</Text>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* CTA Button */}
          <Animated.View
            style={{ opacity: btnOpacity, transform: [{ scale: btnScale }], width: '100%' }}
          >
            <TouchableOpacity
              style={styles.getStartedBtn}
              onPress={() => navigation.replace('Login')}
              activeOpacity={0.85}
            >
              <Text style={styles.getStartedText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </TouchableOpacity>

            <View style={styles.footer}>
              <View style={styles.dot} />
              <View style={[styles.dot, { opacity: 0.4, width: 6, height: 6 }]} />
              <View style={[styles.dot, { opacity: 0.4, width: 6, height: 6 }]} />
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.08,
    paddingBottom: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    filter: 'blur(40px)', // works on web; on native gives soft edge via low opacity
  },
  glowRing: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: COLORS.primary,
    top: -15,
  },
  logoBox: {
    width: 90,
    height: 90,
    borderRadius: 28,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 12,
  },
  appName: {
    color: COLORS.text,
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  taglinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(34,197,94,0.1)',
    borderRadius: RADIUS.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
  },
  taglineText: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },
  rolesContainer: { width: '100%', gap: 10 },
  rolesLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 4,
  },
  rolesRow: { flexDirection: 'row', gap: 10 },
  roleCard: {
    flex: 1,
    borderRadius: RADIUS.xl,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  roleIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitle: { fontSize: 13, fontWeight: '800' },
  roleDesc: { color: COLORS.textMuted, fontSize: 9, textAlign: 'center', lineHeight: 13 },
  getStartedBtn: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  getStartedText: { color: '#fff', fontSize: 17, fontWeight: '800', letterSpacing: 0.5 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
});
