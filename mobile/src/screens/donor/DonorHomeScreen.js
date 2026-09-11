import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { donationApi } from '../../api/donationApi';
import { COLORS, RADIUS, SHADOW } from '../../constants/colors';
import StatusBadge from '../../components/StatusBadge';
import { timeAgo } from '../../utils/helpers';

export default function DonorHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [donations, setDonations] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, delivered: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await donationApi.getMyDonations(1, 5);
      const items = res?.data?.donations || [];
      setDonations(items);
      setStats({
        total: res?.data?.total || 0,
        active: items.filter((d) => ['ACCEPTED', 'PICKED_UP'].includes(d.status)).length,
        delivered: items.filter((d) => d.status === 'DELIVERED').length,
      });
    } catch {}
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 15 seconds so donor sees live updates as volunteers accept/pickup/deliver
    const interval = setInterval(() => {
      fetchData();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
            <Text style={styles.role}>Food Donor</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={styles.iconBtn}>
              <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard icon="layers" label="Total" value={stats.total} color={COLORS.info} />
          <StatCard icon="flash" label="Active" value={stats.active} color={COLORS.warning} />
          <StatCard icon="checkmark-circle" label="Delivered" value={stats.delivered} color={COLORS.success} />
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.donateCTA} onPress={() => navigation.navigate('Donate')}>
          <View>
            <Text style={styles.ctaTitle}>Donate Food Now</Text>
            <Text style={styles.ctaSub}>Help rescue surplus food in your area</Text>
          </View>
          <View style={styles.ctaIconBox}>
            <Ionicons name="add-circle" size={36} color={COLORS.white} />
          </View>
        </TouchableOpacity>

        {/* Recent Donations */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Donations</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {donations.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="leaf-outline" size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No donations yet. Start your first food rescue!</Text>
          </View>
        ) : (
          donations.slice(0, 5).map((d) => (
            <TouchableOpacity key={d._id} style={styles.recentCard} onPress={() => navigation.navigate('DonationDetail', { id: d._id })}>
              <Image source={{ uri: d.imageUrl }} style={styles.recentImg} />
              <View style={styles.recentBody}>
                <Text style={styles.recentTitle} numberOfLines={1}>{d.title}</Text>
                <Text style={styles.recentMeta}>{d.quantityKg} kg · {d.foodCategory?.replace('_', ' ')}</Text>
                <Text style={styles.recentTime}>{timeAgo(d.createdAt)}</Text>
              </View>
              <StatusBadge status={d.status} size="sm" />
            </TouchableOpacity>
          ))
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color, borderTopWidth: 2 }]}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { flex: 1, paddingHorizontal: 18 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 },
  greeting: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  role: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
  headerActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 14, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: COLORS.cardBorder },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 11 },
  donateCTA: {
    backgroundColor: COLORS.primaryDark, borderRadius: RADIUS.xl, padding: 20,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, ...SHADOW.green,
  },
  ctaTitle: { color: COLORS.white, fontSize: 18, fontWeight: '800' },
  ctaSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  ctaIconBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700' },
  viewAll: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
  emptyBox: { alignItems: 'center', gap: 10, paddingVertical: 40 },
  emptyText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center' },
  recentCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: COLORS.cardBorder, gap: 10 },
  recentImg: { width: 50, height: 50, borderRadius: 10 },
  recentBody: { flex: 1, gap: 2 },
  recentTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  recentMeta: { color: COLORS.textMuted, fontSize: 11, textTransform: 'capitalize' },
  recentTime: { color: COLORS.textMuted, fontSize: 10 },
});
