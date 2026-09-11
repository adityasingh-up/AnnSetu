import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { donationApi } from '../../api/donationApi';
import DonationCard from '../../components/DonationCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS, RADIUS } from '../../constants/colors';

const STATUS_FILTERS = ['ALL', 'PENDING', 'ACCEPTED', 'PICKED_UP', 'DELIVERED', 'EXPIRED'];

export default function DonationHistoryScreen({ navigation }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const fetchDonations = useCallback(async (pg = 1) => {
    try {
      const res = await donationApi.getMyDonations(pg, 20);
      setDonations(res?.data?.donations || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDonations(1); }, [fetchDonations]);

  const onRefresh = () => { setRefreshing(true); fetchDonations(1); };

  const filtered = filter === 'ALL' ? donations : donations.filter((d) => d.status === filter);

  if (loading) return <LoadingSpinner message="Loading donations..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>My Donations</Text>
        <Text style={styles.count}>{filtered.length} items</Text>
      </View>

      {/* Filter Chips */}
      <FlatList
        data={STATUS_FILTERS}
        horizontal showsHorizontalScrollIndicator={false}
        keyExtractor={(f) => f}
        contentContainerStyle={styles.filterList}
        renderItem={({ item: f }) => (
          <TouchableOpacity
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && { color: COLORS.white }]}>
              {f === 'ALL' ? 'All' : f.replace('_', ' ')}
            </Text>
          </TouchableOpacity>
        )}
      />

      <FlatList
        data={filtered}
        keyExtractor={(d) => d._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <DonationCard
            donation={item}
            onPress={() => navigation.navigate('DonationDetail', { id: item._id })}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="leaf-outline" size={52} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No {filter === 'ALL' ? '' : filter.toLowerCase()} donations found</Text>
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
  filterList: { paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.cardBorder, backgroundColor: COLORS.inputBg, marginRight: 6 },
  filterChipActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  filterChipText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { color: COLORS.textMuted, fontSize: 14 },
});
