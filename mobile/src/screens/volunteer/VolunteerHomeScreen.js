import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity,
  Switch, Modal, Vibration, Animated, Platform, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { volunteerApi } from '../../api/volunteerApi';
import { donationApi } from '../../api/donationApi';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, RADIUS, SHADOW } from '../../constants/colors';
import { timeAgo } from '../../utils/helpers';

export default function VolunteerHomeScreen({ navigation }) {
  const { user, updateProfile, logout } = useAuth();
  const [missions, setMissions] = useState([]);
  const [available, setAvailable] = useState(user?.isOnline !== false);
  const [refreshing, setRefreshing] = useState(false);

  // Ola / Uber Style Incoming Rescue Alert State
  const [incomingMission, setIncomingMission] = useState(null);
  const [countdown, setCountdown] = useState(30);
  const [accepting, setAccepting] = useState(false);
  const seenDonationIds = useRef(new Set());
  const countdownTimerRef = useRef(null);
  const ringSoundIntervalRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Sync availability with user profile
  useEffect(() => {
    if (user?.isOnline !== undefined) {
      setAvailable(user.isOnline !== false);
    }
  }, [user?.isOnline]);

  // Pulsating animation for radar / alert
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Stop Ringing and Vibration helper
  const stopAlertEffects = useCallback(() => {
    try {
      Vibration.cancel();
    } catch {}
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (ringSoundIntervalRef.current) {
      clearInterval(ringSoundIntervalRef.current);
      ringSoundIntervalRef.current = null;
    }
  }, []);

  // Web Audio Synth for Ringtone on Web / Browser
  const playWebBeep = useCallback(() => {
    try {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(880, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(587.33, ctx.currentTime + 0.25);
          gain.gain.setValueAtTime(0.4, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.28);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.3);
        }
      }
    } catch {}
  }, []);

  // Trigger Incoming Mission Ring & Modal (Ola / Uber Style)
  const triggerIncomingAlert = useCallback((donation) => {
    stopAlertEffects();
    setIncomingMission(donation);
    setCountdown(30);

    // Continuous rhythmic vibration (pattern: wait 0, vib 500ms, wait 200ms, vib 500ms)
    try {
      Vibration.vibrate([0, 500, 200, 500, 200, 500], true);
    } catch {}

    // Audio chime on web
    playWebBeep();
    ringSoundIntervalRef.current = setInterval(() => {
      playWebBeep();
    }, 900);

    // Countdown 30 seconds
    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          stopAlertEffects();
          setIncomingMission(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stopAlertEffects, playWebBeep]);

  // Dismiss / Decline incoming task
  const handleDecline = () => {
    stopAlertEffects();
    if (incomingMission?._id) {
      seenDonationIds.current.add(incomingMission._id);
    }
    setIncomingMission(null);
  };

  // Accept incoming task (Claim)
  const handleAccept = async () => {
    if (!incomingMission) return;
    setAccepting(true);
    const missionId = incomingMission._id || incomingMission.donationId;
    try {
      stopAlertEffects();
      await volunteerApi.acceptTask(missionId);
      setIncomingMission(null);
      await fetchMissions();
      navigation.navigate('MissionDetail', { id: missionId });
    } catch (err) {
      stopAlertEffects();
      setIncomingMission(null);
      alert(err.message || 'Could not claim task. It may have already been accepted.');
    } finally {
      setAccepting(false);
    }
  };

  const fetchMissions = useCallback(async () => {
    try {
      const res = await volunteerApi.getMyMissions();
      setMissions(res?.data || []);
    } catch {}
  }, []);

  // Radar: Scan for nearby pending donations when available is true
  const scanForNearbyDonations = useCallback(async () => {
    if (!available) return;
    try {
      const lat = user?.location?.coordinates?.[1] || 28.6139;
      const lng = user?.location?.coordinates?.[0] || 77.209;
      const res = await donationApi.getNearby(lat, lng, 30);
      const pendingList = (res?.data || []).filter((d) => d.status === 'PENDING');

      // Check if there is any new pending donation we haven't alerted for
      for (const d of pendingList) {
        if (!seenDonationIds.current.has(d._id) && !incomingMission) {
          seenDonationIds.current.add(d._id);
          triggerIncomingAlert(d);
          break;
        }
      }
    } catch {}
  }, [available, user, incomingMission, triggerIncomingAlert]);

  useEffect(() => {
    fetchMissions();
    const interval = setInterval(() => {
      fetchMissions();
      if (available) {
        scanForNearbyDonations();
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchMissions, available, scanForNearbyDonations]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => stopAlertEffects();
  }, [stopAlertEffects]);

  // Toggle Availability
  const handleToggleAvailability = async (val) => {
    setAvailable(val);
    if (!val) {
      stopAlertEffects();
      setIncomingMission(null);
    }
    try {
      await updateProfile({ isOnline: val });
    } catch {}
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMissions();
    await scanForNearbyDonations();
    setRefreshing(false);
  };

  const active = missions.filter((m) => ['ACCEPTED', 'PICKED_UP'].includes(m.status));
  const completed = missions.filter((m) => m.status === 'DELIVERED');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hi, {user?.name?.split(' ')[0]} 🚴</Text>
            <Text style={styles.role}>Volunteer · ⭐ {user?.rating || 5.0} · {user?.badgePoints || 100} pts</Text>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.iconBtn}>
              <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Ola/Uber Style Availability & Live Radar Card */}
        <View style={[styles.availabilityCard, available ? styles.availOn : styles.availOff]}>
          <View style={{ flex: 1 }}>
            <View style={styles.availHeaderRow}>
              <Animated.View style={[styles.statusDot, { transform: [{ scale: available ? pulseAnim : 1 }] }]} />
              <Text style={styles.availTitle}>
                {available ? '🟢 Online (Radar Active)' : '🔴 Offline (Break Mode)'}
              </Text>
            </View>
            <Text style={styles.availSub}>
              {available
                ? 'Listening for nearby food rescue requests like Ola/Uber driver'
                : 'Turn ON to receive real-time incoming rescue alarms'}
            </Text>
          </View>
          <Switch
            value={available}
            onValueChange={handleToggleAvailability}
            trackColor={{ false: COLORS.danger, true: COLORS.primary }}
            thumbColor={COLORS.white}
          />
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox icon="flash" label="Active" value={active.length} color={COLORS.warning} />
          <StatBox icon="checkmark-circle" label="Delivered" value={completed.length} color={COLORS.success} />
          <StatBox icon="ribbon" label="Badge Pts" value={user?.badgePoints || 0} color={COLORS.info} />
        </View>

        {/* Find Nearby CTA */}
        <TouchableOpacity style={styles.nearbyCTA} onPress={() => navigation.navigate('Nearby')}>
          <Ionicons name="map" size={24} color={COLORS.white} />
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Find Nearby Donations</Text>
            <Text style={styles.ctaSub}>Browse & claim available food packages in your area</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Demo Trigger Test Button (For instant verification) */}
        <TouchableOpacity
          style={styles.simulateBtn}
          onPress={() => {
            triggerIncomingAlert({
              _id: 'demo_' + Date.now(),
              title: 'Fresh Veg Biryani & Rotis',
              foodCategory: 'Cooked Meals',
              quantityKg: 15,
              servingsCount: 60,
              freshnessScore: 96,
              pickupLocation: { address: 'Connaught Place, New Delhi (1.2 km away)' },
              expiryTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
            });
          }}
        >
          <Ionicons name="notifications" size={16} color={COLORS.warning} />
          <Text style={styles.simulateBtnText}>Test Ola/Uber Style Ringing Alarm</Text>
        </TouchableOpacity>

        {/* Empty state when no active or completed missions */}
        {active.length === 0 && completed.length === 0 && (
          <View style={styles.emptyMissionBox}>
            <Ionicons name="bicycle-outline" size={50} color={COLORS.textMuted} />
            <Text style={styles.emptyMissionTitle}>No Active Missions</Text>
            <Text style={styles.emptyMissionSub}>
              You don't have any food delivery tasks right now.{'\n'}Keep your radar ON to receive incoming rescue requests!
            </Text>
          </View>
        )}

        {/* Active Missions */}
        {active.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>🔥 Active Rescue Missions</Text>
            {active.map((m) => (
              <TouchableOpacity key={m._id} style={styles.missionCard} onPress={() => navigation.navigate('MissionDetail', { id: m._id })}>
                <View style={styles.missionInfo}>
                  <Text style={styles.missionTitle} numberOfLines={1}>{m.title}</Text>
                  <Text style={styles.missionMeta}>{m.quantityKg} kg · {m.pickupLocation?.address || 'Near you'}</Text>
                  <Text style={styles.missionTime}>{timeAgo(m.updatedAt)}</Text>
                </View>
                <View style={styles.missionRight}>
                  <StatusBadge status={m.status} size="sm" />
                  <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* Recent Completed */}
        {completed.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Deliveries</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Missions')}>
                <Text style={styles.viewAll}>View All</Text>
              </TouchableOpacity>
            </View>
            {completed.slice(0, 3).map((m) => (
              <TouchableOpacity key={m._id} style={styles.missionCard} onPress={() => navigation.navigate('MissionDetail', { id: m._id })}>
                <View style={styles.missionInfo}>
                  <Text style={styles.missionTitle} numberOfLines={1}>{m.title}</Text>
                  <Text style={styles.missionMeta}>{m.quantityKg} kg · +50 pts earned</Text>
                </View>
                <StatusBadge status={m.status} size="sm" />
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>

      {/* ========================================================================= */}
      {/* 🚨 OLA / UBER DRIVER STYLE INCOMING RESCUE POPUP MODAL WITH RING & TIMER 🚨 */}
      {/* ========================================================================= */}
      <Modal
        visible={!!incomingMission}
        animationType="slide"
        transparent={true}
        onRequestClose={handleDecline}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.alertCard}>
            {/* Pulsing Beacon Header */}
            <View style={styles.alertHeader}>
              <Animated.View style={[styles.beaconCircle, { transform: [{ scale: pulseAnim }] }]}>
                <Ionicons name="notifications-active" size={32} color={COLORS.white} />
              </Animated.View>
              <Text style={styles.alertTitle}>🚨 NEW RESCUE MISSION!</Text>
              <Text style={styles.alertSubtitle}>Incoming food rescue request near you</Text>

              {/* Countdown timer pill */}
              <View style={styles.countdownPill}>
                <Ionicons name="timer-outline" size={16} color={COLORS.warning} />
                <Text style={styles.countdownText}>{countdown}s Remaining</Text>
              </View>
            </View>

            {/* Donation Details Card */}
            <View style={styles.alertBody}>
              <Text style={styles.foodTitle}>{incomingMission?.title}</Text>

              <View style={styles.metaRow}>
                <View style={styles.metaBadge}>
                  <Text style={styles.metaBadgeText}>{incomingMission?.quantityKg} Kg</Text>
                </View>
                <View style={[styles.metaBadge, { backgroundColor: 'rgba(34,197,94,0.15)' }]}>
                  <Text style={[styles.metaBadgeText, { color: COLORS.primary }]}>
                    ⭐ {incomingMission?.freshnessScore}% Fresh
                  </Text>
                </View>
                <View style={[styles.metaBadge, { backgroundColor: 'rgba(234,179,8,0.15)' }]}>
                  <Text style={[styles.metaBadgeText, { color: COLORS.warning }]}>
                    {incomingMission?.servingsCount || Math.round((incomingMission?.quantityKg || 5) * 4)} Meals
                  </Text>
                </View>
              </View>

              <View style={styles.locationBox}>
                <Ionicons name="location" size={18} color={COLORS.danger} />
                <Text style={styles.locationText} numberOfLines={2}>
                  {incomingMission?.pickupLocation?.address || 'Pickup location provided by donor'}
                </Text>
              </View>
            </View>

            {/* Accept / Decline Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity
                style={styles.declineBtn}
                onPress={handleDecline}
                disabled={accepting}
              >
                <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={handleAccept}
                disabled={accepting}
              >
                {accepting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                    <Text style={styles.acceptBtnText}>ACCEPT MISSION</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatBox({ icon, label, value, color }) {
  return (
    <View style={[styles.statBox, { borderTopColor: color, borderTopWidth: 2 }]}>
      <Ionicons name={icon} size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18 },
  greeting: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  role: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  availabilityCard: { marginHorizontal: 18, borderRadius: RADIUS.xl, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderWidth: 1 },
  availOn: { backgroundColor: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.4)' },
  availOff: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.4)' },
  availHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.primary },
  availTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  availSub: { color: COLORS.textMuted, fontSize: 11, marginTop: 4, paddingRight: 10 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 12, alignItems: 'center', gap: 3, borderWidth: 1, borderColor: COLORS.cardBorder },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 10 },
  nearbyCTA: { marginHorizontal: 18, backgroundColor: COLORS.primaryDark, borderRadius: RADIUS.xl, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, ...SHADOW.green },
  ctaTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  ctaSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  simulateBtn: { marginHorizontal: 18, marginBottom: 16, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: 'rgba(234,179,8,0.1)', borderWidth: 1, borderColor: 'rgba(234,179,8,0.3)', borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  simulateBtnText: { color: COLORS.warning, fontSize: 12, fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18 },
  sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700', paddingHorizontal: 18, marginBottom: 8 },
  viewAll: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  missionCard: { marginHorizontal: 18, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder, gap: 10 },
  missionInfo: { flex: 1, gap: 2 },
  missionTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  missionMeta: { color: COLORS.textMuted, fontSize: 11 },
  missionTime: { color: COLORS.textMuted, fontSize: 10 },
  missionRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  emptyMissionBox: { marginHorizontal: 18, backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: 30, alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 16 },
  emptyMissionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  emptyMissionSub: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center', lineHeight: 18 },

  // Ola/Uber Modal Styles
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  alertCard: { width: '100%', maxWidth: 380, backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, borderWidth: 2, borderColor: COLORS.primary, overflow: 'hidden', ...SHADOW.green },
  alertHeader: { backgroundColor: COLORS.primaryDark, padding: 22, alignItems: 'center', gap: 6 },
  beaconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  alertTitle: { color: COLORS.white, fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  alertSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  countdownPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.35)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: RADIUS.full, marginTop: 6 },
  countdownText: { color: COLORS.warning, fontSize: 12, fontWeight: '800' },
  alertBody: { padding: 20, gap: 12 },
  foodTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800', textAlign: 'center' },
  metaRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  metaBadge: { backgroundColor: COLORS.inputBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.md },
  metaBadgeText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  locationBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: COLORS.inputBg, padding: 12, borderRadius: RADIUS.lg, marginTop: 4 },
  locationText: { color: COLORS.textMuted, fontSize: 12, flex: 1, lineHeight: 18 },
  actionButtonsRow: { flexDirection: 'row', padding: 16, gap: 12, backgroundColor: COLORS.bg },
  declineBtn: { flex: 1, paddingVertical: 14, borderRadius: RADIUS.xl, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.cardBorder, backgroundColor: COLORS.card },
  declineBtnText: { color: COLORS.textMuted, fontWeight: '700', fontSize: 14 },
  acceptBtn: { flex: 2, paddingVertical: 14, borderRadius: RADIUS.xl, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: COLORS.primaryDark, ...SHADOW.green },
  acceptBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
});
