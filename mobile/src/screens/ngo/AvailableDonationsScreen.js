import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { donationApi } from '../../api/donationApi';
import { ngoApi } from '../../api/ngoApi';
import DonationCard from '../../components/DonationCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS } from '../../constants/colors';

export default function AvailableDonationsScreen({ navigation }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDonations = useCallback(async () => {
    try {
      let lat = 28.6139, lng = 77.209;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          lat = loc.coords.latitude;
          lng = loc.coords.longitude;
        }
      } catch {}
      const res = await donationApi.getNearby(lat, lng, 30);
      setDonations(res?.data || []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchDonations(); }, [fetchDonations]);
  const onRefresh = () => { setRefreshing(true); fetchDonations(); };

  const handleClaim = (donationId) => {
    Alert.alert('Claim Donation?', 'Assign this donation to your NGO for distribution.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Claim', onPress: async () => {
          try {
            await ngoApi.claimDonation(donationId);
            Alert.alert('✅ Claimed!', 'Donation assigned to your NGO.');
            fetchDonations();
          } catch (err) {
            Alert.alert('Failed', err.message || 'Could not claim donation.');
          }
        }
      },
    ]);
  };

  if (loading) return <LoadingSpinner message="Finding available donations..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Available Donations</Text>
        <Text style={styles.count}>{donations.length} found</Text>
      </View>

      <FlatList
        data={donations}
        keyExtractor={(d) => d._id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
        renderItem={({ item }) => (
          <DonationCard
            donation={item}
            showActions
            onPress={() => navigation.navigate('DonationDetail', { id: item._id })}
            onAccept={() => handleClaim(item._id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={52} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No available donations right now</Text>
            <Text style={styles.emptySubText}>Pull down to refresh</Text>
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
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  emptySubText: { color: COLORS.textMuted, fontSize: 12 },
});
