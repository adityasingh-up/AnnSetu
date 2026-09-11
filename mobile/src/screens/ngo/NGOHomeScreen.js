import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ngoApi } from '../../api/ngoApi';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, RADIUS, SHADOW } from '../../constants/colors';
import { timeAgo } from '../../utils/helpers';

export default function NGOHomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [inventory, setInventory] = useState({ donations: [], profile: null });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await ngoApi.getInventory();
      setInventory({
        donations: res?.data?.donations || [],
        profile: res?.data?.profile || null,
      });
    } catch {
      // keep existing state on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = async () => { setRefreshing(true); await fetchData(); setRefreshing(false); };

  const all = inventory.donations;
  // Incoming: food that has been accepted or picked up — en route to NGO
  const incoming = all.filter((d) => ['ACCEPTED', 'PICKED_UP'].includes(d.status));
  // Delivered/distributed
  const delivered = all.filter((d) => d.status === 'DELIVERED');
  // Pending donations available to claim
  const pending = all.filter((d) => d.status === 'PENDING');

  // Real computed stats from actual data
  const totalKgDistributed = delivered.reduce((sum, d) => sum + (d.quantityKg || 0), 0);
  const totalMealsServed = delivered.reduce((sum, d) => sum + (d.servingsCount || 0), 0);
  const totalBeneficiaries = delivered.reduce((sum, d) => sum + (d.beneficiaryCount || 0), 0);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting} numberOfLines={1}>
              {user?.organizationName || user?.name} 🏢
            </Text>
            <Text style={styles.role}>NGO Partner Dashboard</Text>
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

        {/* Impact Stats — Real data only */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Distribution Impact</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <Ionicons name="reload-outline" size={28} color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading NGO data...</Text>
          </View>
        ) : (
          <>
            <View style={styles.statsRow}>
              <StatBox
                icon="scale-outline"
                label="Kg Distributed"
                value={totalKgDistributed > 0 ? `${totalKgDistributed.toFixed(1)}` : '0'}
                color={COLORS.info}
              />
              <StatBox
                icon="restaurant-outline"
                label="Meals Served"
                value={totalMealsServed > 0 ? totalMealsServed.toString() : '0'}
                color={COLORS.success}
              />
              <StatBox
                icon="people-outline"
                label="Beneficiaries"
                value={totalBeneficiaries > 0 ? totalBeneficiaries.toString() : '0'}
                color={COLORS.warning}
              />
            </View>

            {/* Empty state when no data at all */}
            {all.length === 0 && (
              <View style={styles.emptyHeroBox}>
                <Ionicons name="business-outline" size={56} color={COLORS.textMuted} />
                <Text style={styles.emptyHeroTitle}>No Food Data Yet</Text>
                <Text style={styles.emptyHeroText}>
                  Your NGO hasn't received any food donations yet.{'\n'}
                  Donors will assign food rescues to your NGO soon.
                </Text>
              </View>
            )}

            {/* Incoming / In-Transit Donations */}
            {incoming.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    🚚 Incoming ({incoming.length})
                  </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
                    <Text style={styles.viewAll}>View All</Text>
                  </TouchableOpacity>
                </View>
                {incoming.slice(0, 3).map((d) => (
                  <TouchableOpacity
                    key={d._id}
                    style={styles.incomingCard}
                    onPress={() => navigation.navigate('DonationDetail', { id: d._id })}
                  >
                    <View style={styles.incomingIconBox}>
                      <Text style={{ fontSize: 24 }}>🍱</Text>
                    </View>
                    <View style={styles.incomingBody}>
                      <Text style={styles.incomingTitle} numberOfLines={1}>{d.title}</Text>
                      <Text style={styles.incomingMeta}>
                        {d.quantityKg} kg · {d.servingsCount} servings
                      </Text>
                      <Text style={styles.incomingEta}>
                        {d.status === 'PICKED_UP' ? '🚴 En route to you' : '✅ Volunteer assigned'}
                      </Text>
                    </View>
                    <StatusBadge status={d.status} size="sm" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Pending donations (not yet claimed by a volunteer) */}
            {pending.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>⏳ Awaiting Pickup ({pending.length})</Text>
                </View>
                {pending.slice(0, 2).map((d) => (
                  <TouchableOpacity
                    key={d._id}
                    style={[styles.activityCard, { borderLeftColor: COLORS.warning, borderLeftWidth: 3 }]}
                    onPress={() => navigation.navigate('DonationDetail', { id: d._id })}
                  >
                    <View style={styles.activityBody}>
                      <Text style={styles.activityTitle} numberOfLines={1}>{d.title}</Text>
                      <Text style={styles.activityMeta}>
                        {d.quantityKg} kg · {d.pickupLocation?.address || 'Address not available'}
                      </Text>
                      <Text style={[styles.activityMeta, { color: COLORS.warning }]}>
                        Waiting for volunteer
                      </Text>
                    </View>
                    <StatusBadge status={d.status} size="sm" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* Recent Activity */}
            {all.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Activity</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
                    <Text style={styles.viewAll}>View All</Text>
                  </TouchableOpacity>
                </View>
                {all.slice(0, 5).map((d) => (
                  <TouchableOpacity
                    key={d._id}
                    style={styles.activityCard}
                    onPress={() => navigation.navigate('DonationDetail', { id: d._id })}
                  >
                    <View style={[styles.statusDot, { backgroundColor: COLORS.status?.[d.status] || COLORS.textMuted }]} />
                    <View style={styles.activityBody}>
                      <Text style={styles.activityTitle} numberOfLines={1}>{d.title}</Text>
                      <Text style={styles.activityMeta}>{d.quantityKg} kg · {timeAgo(d.updatedAt)}</Text>
                    </View>
                    <StatusBadge status={d.status} size="sm" />
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* CTA: Go to Distribution */}
            {incoming.length > 0 && (
              <TouchableOpacity
                style={styles.distributeCTA}
                onPress={() => navigation.navigate('Inventory')}
              >
                <Ionicons name="checkmark-done-circle" size={24} color={COLORS.white} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.ctaTitle}>Record Distribution</Text>
                  <Text style={styles.ctaSub}>Mark received food as distributed to beneficiaries</Text>
                </View>
                <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            )}
          </>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
  },
  greeting: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  role: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  loadingText: { color: COLORS.textMuted, fontSize: 13 },
  statsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, marginBottom: 14 },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 12,
    alignItems: 'center',
    gap: 3,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { color: COLORS.textMuted, fontSize: 9, textAlign: 'center' },

  // Empty hero state
  emptyHeroBox: {
    marginHorizontal: 18,
    marginVertical: 20,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 32,
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  emptyHeroTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  emptyHeroText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitle: { color: COLORS.text, fontSize: 15, fontWeight: '700' },
  viewAll: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },

  incomingCard: {
    marginHorizontal: 18,
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOW.sm,
  },
  incomingIconBox: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  incomingBody: { flex: 1, gap: 3 },
  incomingTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  incomingMeta: { color: COLORS.textMuted, fontSize: 12 },
  incomingEta: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },

  activityCard: {
    marginHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 10,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  activityBody: { flex: 1, gap: 2 },
  activityTitle: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
  activityMeta: { color: COLORS.textMuted, fontSize: 11 },

  distributeCTA: {
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: COLORS.primaryDark,
    borderRadius: RADIUS.xl,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...SHADOW.green,
  },
  ctaTitle: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  ctaSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 1 },
});
