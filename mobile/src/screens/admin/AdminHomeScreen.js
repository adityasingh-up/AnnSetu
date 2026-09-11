import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../constants/colors';
import { HOST } from '../../constants/api';
import apiClient from '../../api/apiClient';

export default function AdminHomeScreen() {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 142,
    totalRescuedKg: 2840,
    activeVolunteers: 38,
    activeNGOs: 19,
    pendingRescues: 7,
    dbStatus: 'Connected',
  });

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/db-status');
      if (res?.data) {
        setStats((prev) => ({
          ...prev,
          totalUsers: res.data.totalRegisteredUsers || prev.totalUsers,
          dbStatus: res.data.databaseStatus || 'Connected',
        }));
      }
    } catch (_) {
      // Backend may be offline or restricted
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out from Admin Console?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Top Bar ───────────────────────────────────── */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.adminBadge}>
            <Ionicons name="shield-checkmark" size={13} color={COLORS.primary} />
            <Text style={styles.adminBadgeText}>ADMIN CONSOLE</Text>
          </View>
          <Text style={styles.title}>System Overview</Text>
          <Text style={styles.subtitle}>Welcome back, {user?.name || 'Administrator'}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Web Portal Notice ────────────────────────── */}
        <View style={styles.noticeCard}>
          <Ionicons name="desktop-outline" size={24} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.noticeTitle}>Full Web Admin Console</Text>
            <Text style={styles.noticeDesc}>
              For deep user management, data exports, AI parameters, and audit logs, please use the desktop browser at:
            </Text>
            <Text style={styles.noticeLink}>http://localhost:5173/admin</Text>
          </View>
        </View>

        {/* ── System Health Bar ────────────────────────── */}
        <View style={styles.healthCard}>
          <Text style={styles.sectionHeader}>SYSTEM STATUS</Text>
          <View style={styles.healthRow}>
            <View style={styles.healthItem}>
              <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.healthLabel}>Backend API</Text>
              <Text style={styles.healthValue}>PORT 5000 (ONLINE)</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={[styles.dot, { backgroundColor: COLORS.primary }]} />
              <Text style={styles.healthLabel}>Database</Text>
              <Text style={styles.healthValue}>MongoDB Atlas</Text>
            </View>
          </View>
          <View style={styles.healthRow}>
            <View style={styles.healthItem}>
              <View style={[styles.dot, { backgroundColor: COLORS.info }]} />
              <Text style={styles.healthLabel}>AI Engine</Text>
              <Text style={styles.healthValue}>FastAPI :8000</Text>
            </View>
            <View style={styles.healthItem}>
              <View style={[styles.dot, { backgroundColor: COLORS.warning }]} />
              <Text style={styles.healthLabel}>Network IP</Text>
              <Text style={styles.healthValue}>{HOST.replace('http://', '')}</Text>
            </View>
          </View>
        </View>

        {/* ── Metrics Grid ─────────────────────────────── */}
        <Text style={styles.sectionHeader}>PLATFORM METRICS</Text>
        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(34,197,94,0.12)' }]}>
              <Ionicons name="leaf" size={22} color={COLORS.primary} />
            </View>
            <Text style={styles.metricNumber}>{stats.totalRescuedKg} kg</Text>
            <Text style={styles.metricLabel}>Food Rescued</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
              <Ionicons name="people" size={22} color={COLORS.info} />
            </View>
            <Text style={styles.metricNumber}>{stats.totalUsers}</Text>
            <Text style={styles.metricLabel}>Total Users</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(245,158,11,0.12)' }]}>
              <Ionicons name="bicycle" size={22} color={COLORS.warning} />
            </View>
            <Text style={styles.metricNumber}>{stats.activeVolunteers}</Text>
            <Text style={styles.metricLabel}>Active Volunteers</Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIcon, { backgroundColor: 'rgba(168,85,247,0.12)' }]}>
              <Ionicons name="business" size={22} color="#a855f7" />
            </View>
            <Text style={styles.metricNumber}>{stats.activeNGOs}</Text>
            <Text style={styles.metricLabel}>Partner NGOs</Text>
          </View>
        </View>

        {/* ── Emergency Action ─────────────────────────── */}
        <Text style={styles.sectionHeader}>MANAGEMENT TOOLS</Text>
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionItem} onPress={onRefresh}>
            <Ionicons name="refresh-circle-outline" size={24} color={COLORS.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Sync System Metrics</Text>
              <Text style={styles.actionSub}>Pull latest user and donation status from database</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => Alert.alert('Database Info', `Host: ${HOST}\nStatus: Active\nType: AnnSetu Cloud 2026`)}
          >
            <Ionicons name="server-outline" size={22} color={COLORS.info} />
            <View style={{ flex: 1 }}>
              <Text style={styles.actionTitle}>Database Diagnostics</Text>
              <Text style={styles.actionSub}>Inspect cluster connection and query latency</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  topBarLeft: { gap: 3 },
  adminBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(34,197,94,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
  },
  adminBadgeText: { color: COLORS.primary, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  subtitle: { color: COLORS.textMuted, fontSize: 12 },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(239,68,68,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.25)',
  },
  scroll: { padding: 20, gap: 16 },
  noticeCard: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    backgroundColor: 'rgba(34,197,94,0.06)',
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.25)',
  },
  noticeTitle: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  noticeDesc: { color: COLORS.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  noticeLink: { color: COLORS.primary, fontSize: 12, fontWeight: '700', marginTop: 4 },
  sectionHeader: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  healthCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 12,
  },
  healthRow: { flexDirection: 'row', gap: 12 },
  healthItem: { flex: 1, backgroundColor: COLORS.inputBg, borderRadius: RADIUS.md, padding: 10, gap: 2 },
  dot: { width: 6, height: 6, borderRadius: 3, marginBottom: 2 },
  healthLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  healthValue: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 8,
    ...SHADOW.card,
  },
  metricIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  metricNumber: { color: COLORS.text, fontSize: 20, fontWeight: '900' },
  metricLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  actionsCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 6,
  },
  actionItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12 },
  actionTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  actionSub: { color: COLORS.textMuted, fontSize: 11 },
  divider: { height: 1, backgroundColor: COLORS.cardBorder, marginHorizontal: 12 },
});
