import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { donationApi } from '../../api/donationApi';
import DonationCard from '../../components/DonationCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import { volunteerApi } from '../../api/volunteerApi';
import { COLORS } from '../../constants/colors';

export default function NearbyDonationsScreen({ navigation }) {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  const getLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. Showing New Delhi area donations.');
        return { latitude: 28.6139, longitude: 77.209 };
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc.coords);
      return loc.coords;
    } catch {
      return { latitude: 28.6139, longitude: 77.209 };
    }
  }, []);

  const fetchNearby = useCallback(async () => {
    const coords = await getLocation();
    try {
      const res = await donationApi.getNearby(
        coords?.latitude || 28.6139,
        coords?.longitude || 77.209,
        20
      );
      setDonations(res?.data || []);
    } catch (err) {
      Alert.alert('Error', 'Could not fetch nearby donations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getLocation]);

  useEffect(() => { fetchNearby(); }, [fetchNearby]);

  const onRefresh = () => { setRefreshing(true); fetchNearby(); };

  const handleAccept = async (donationId) => {
    Alert.alert('Accept Mission?', 'Confirm you will pick up this donation.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept', onPress: async () => {
          try {
            await volunteerApi.acceptTask(donationId);
            Alert.alert('✅ Mission Accepted!', 'OTP will be sent to donor. Navigate to MissionDetail to proceed.');
            fetchNearby();
            navigation.navigate('Dashboard');
          } catch (err) {
            Alert.alert('Failed', err.message || 'Could not accept mission.');
          }
        }
      },
    ]);
  };

  if (loading) return <LoadingSpinner message="Finding nearby donations..." />;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Nearby Donations</Text>
        <View style={styles.locationPill}>
          <Ionicons name="location" size={12} color={location ? COLORS.success : COLORS.warning} />
          <Text style={[styles.locationText, { color: location ? COLORS.success : COLORS.warning }]}>
            {location ? 'GPS Active' : 'Default Location'}
          </Text>
        </View>
      </View>

      {locationError ? (
        <View style={styles.locationBanner}>
          <Ionicons name="information-circle" size={14} color={COLORS.warning} />
          <Text style={styles.locationBannerText}>{locationError}</Text>
        </View>
      ) : null}

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
            onPress={() => navigation.navigate('MissionDetail', { id: item._id })}
            onAccept={() => handleAccept(item._id)}
          />
        )}
        ListHeaderComponent={
          <Text style={styles.resultsCount}>{donations.length} active donations within 20 km</Text>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="map-outline" size={52} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No pending donations in your area</Text>
            <Text style={styles.emptySubText}>Pull down to refresh or check back later</Text>
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
  locationPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.card, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: COLORS.cardBorder },
  locationText: { fontSize: 11, fontWeight: '600' },
  locationBanner: { marginHorizontal: 18, marginBottom: 8, flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: 'rgba(245,158,11,0.1)', padding: 10, borderRadius: 10 },
  locationBannerText: { color: COLORS.warning, fontSize: 11, flex: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  resultsCount: { color: COLORS.textMuted, fontSize: 12, marginBottom: 10 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 10 },
  emptyText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '600' },
  emptySubText: { color: COLORS.textMuted, fontSize: 12 },
});
