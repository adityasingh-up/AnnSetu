import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { volunteerApi } from '../../api/volunteerApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS, RADIUS } from '../../constants/colors';
import { timeAgo } from '../../utils/helpers';

export default function MissionHistoryScreen({ navigation }) {
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMissions = useCallback(async () => {
    try {
      const res = await volunteerApi.getMyMissions();
      setMissions(res?.data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchMissions(); }, [fetchMissions]);

  const onRefresh = () => { setRefreshing(true); fetchMissions(); };

  if (loading) return <LoadingSpinner message="Loading missions..." />;

  const active = missions.filter((m) => ['ACCEPTED', 'PICKED_UP'].includes(m.status));
  const completed = missions.filter((m) => m.status === 'DELIVERED');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Missions</Text>
        <Text style={styles.count}>{missions.length} total</Text>
      </View>

      <FlatList
        data={[...active, ...completed]}
        keyExtractor={(m) => m._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.missionCard} onPress={() => navigation.navigate('MissionDetail', { id: item._id })}>
            <View style={[styles.statusStrip, { backgroundColor: COLORS.status[item.status] || COLORS.textMuted }]} />
            <View style={styles.missionBody}>
              <View style={styles.topRow}>
                <Text style={styles.missionTitle} numberOfLines={1}>{item.title}</Text>
                <StatusBadge status={item.status} size="sm" />
              </View>
              <Text style={styles.missionMeta}>
                {item.quantityKg} kg · {item.foodCategory?.replace('_', ' ')} · {item.foodType}
              </Text>
              {item.pickupLocation?.address && (
                <View style={styles.locRow}>
                  <Ionicons name="location-outline" size={11} color={COLORS.textMuted} />
                  <Text style={styles.locText} numberOfLines={1}>{item.pickupLocation.address}</Text>
                </View>
              )}
              <Text style={styles.missionTime}>{timeAgo(item.updatedAt)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={52} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No missions yet</Text>
            <Text style={styles.emptySubText}>Accept nearby donations to start rescuing food</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  count: { color: COLORS.primary, fontWeight: '700', fontSize: 13 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  missionCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg, marginBottom: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  statusStrip: { width: 4, alignSelf: 'stretch' },
  missionBody: { flex: 1, padding: 12, gap: 3 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  missionTitle: { flex: 1, color: COLORS.text, fontSize: 14, fontWeight: '700' },
  missionMeta: { color: COLORS.textMuted, fontSize: 11, textTransform: 'capitalize' },
  locRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locText: { color: COLORS.textMuted, fontSize: 11, flex: 1 },
  missionTime: { color: COLORS.textMuted, fontSize: 10 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  emptySubText: { color: COLORS.textMuted, fontSize: 12 },
});
