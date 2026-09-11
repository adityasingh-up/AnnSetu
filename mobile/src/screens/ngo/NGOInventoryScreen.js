import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ngoApi } from '../../api/ngoApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS, RADIUS } from '../../constants/colors';
import { timeAgo } from '../../utils/helpers';

export default function NGOInventoryScreen({ navigation }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInventory = useCallback(async () => {
    try {
      const res = await ngoApi.getInventory();
      setDonations(res?.data?.donations || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);
  const onRefresh = () => { setRefreshing(true); fetchInventory(); };

  if (loading) return <LoadingSpinner message="Loading inventory..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>NGO Inventory</Text>
        <Text style={styles.count}>{donations.length} items</Text>
      </View>

      <FlatList
        data={donations}
        keyExtractor={(d) => d._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.inventoryCard}
            onPress={() => {
              if (['PICKED_UP', 'DELIVERED'].includes(item.status)) {
                navigation.navigate('Distribution', { donation: item });
              } else {
                navigation.navigate('DonationDetail', { id: item._id });
              }
            }}
          >
            <View style={[styles.strip, { backgroundColor: COLORS.status[item.status] }]} />
            <View style={styles.cardBody}>
              <View style={styles.topRow}>
                <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
                <StatusBadge status={item.status} size="sm" />
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaText}>{item.quantityKg} kg</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>{item.servingsCount} meals</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaText}>{item.foodType}</Text>
              </View>
              {item.donorId?.name && (
                <Text style={styles.donorText}>From: {item.donorId.name}</Text>
              )}
              <Text style={styles.timeText}>{timeAgo(item.updatedAt)}</Text>

              {item.status === 'PICKED_UP' && (
                <View style={styles.actionHint}>
                  <Ionicons name="arrow-forward-circle" size={14} color={COLORS.primary} />
                  <Text style={styles.actionHintText}>Tap to record distribution</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="layers-outline" size={52} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No donations in inventory</Text>
            <Text style={styles.emptySubText}>Claim donations from the Available tab</Text>
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
  inventoryCard: {
    flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: RADIUS.lg,
    marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  strip: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: 14, gap: 4 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, color: COLORS.text, fontSize: 14, fontWeight: '700' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: COLORS.textMuted, fontSize: 11, textTransform: 'capitalize' },
  metaDot: { color: COLORS.textMuted, fontSize: 11 },
  donorText: { color: COLORS.textMuted, fontSize: 11 },
  timeText: { color: COLORS.textMuted, fontSize: 10 },
  actionHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  actionHintText: { color: COLORS.primary, fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  emptySubText: { color: COLORS.textMuted, fontSize: 12 },
});
