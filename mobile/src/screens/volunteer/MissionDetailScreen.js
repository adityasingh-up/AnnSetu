import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { donationApi } from '../../api/donationApi';
import { volunteerApi } from '../../api/volunteerApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS, RADIUS, SHADOW } from '../../constants/colors';
import { formatDateTime, openMapsNavigation, timeUntil } from '../../utils/helpers';

export default function MissionDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDonation = async () => {
    try {
      const res = await donationApi.getById(id);
      setDonation(res?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDonation(); }, [id]);

  const handleCompleteDelivery = () => {
    Alert.alert('Complete Delivery?', 'Confirm you have delivered this food to the NGO.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm Delivery', onPress: async () => {
          setActionLoading(true);
          try {
            await volunteerApi.completeDelivery(donation._id);
            Alert.alert('🎉 Delivery Completed!', 'You earned 50 Badge Points! Great rescue mission.', [
              { text: 'Back to Dashboard', onPress: () => navigation.navigate('Dashboard') },
            ]);
          } catch (err) {
            Alert.alert('Error', err.message);
          } finally {
            setActionLoading(false);
          }
        }
      },
    ]);
  };

  if (loading) return <LoadingSpinner message="Loading mission..." />;
  if (!donation) return <View style={styles.safe}><Text style={{ color: COLORS.danger, padding: 20 }}>Mission not found</Text></View>;

  const coords = donation.pickupLocation?.coordinates;
  const donorPhone = donation.donorId?.phone;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mission Detail</Text>
          <StatusBadge status={donation.status} size="sm" />
        </View>

        <View style={styles.body}>
          {/* Mission Card */}
          <View style={styles.missionCard}>
            <Text style={styles.foodTitle}>{donation.title}</Text>
            <View style={styles.metaRow}>
              <Chip icon="scale" label={`${donation.quantityKg} kg`} />
              <Chip icon="people" label={`${donation.servingsCount} meals`} />
              <Chip icon="leaf" label={donation.foodType} />
              <Chip icon="time" label={timeUntil(donation.expiryTime)} color={COLORS.warning} />
            </View>
            <View style={styles.freshnessBar}>
              <Text style={styles.freshnessLabel}>Freshness Score</Text>
              <Text style={styles.freshnessValue}>{donation.freshnessScore}%</Text>
            </View>
          </View>

          {/* Donor Contact */}
          {donation.donorId && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Donor Contact</Text>
              <View style={styles.contactCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{donation.donorId?.name?.[0]}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.contactName}>{donation.donorId.name}</Text>
                  <Text style={styles.contactPhone}>{donation.donorId.phone}</Text>
                </View>
                {donorPhone && (
                  <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${donorPhone}`)}>
                    <Ionicons name="call" size={16} color={COLORS.white} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Pickup Location */}
          {donation.pickupLocation?.address && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pickup Location</Text>
              <TouchableOpacity style={styles.locationCard} onPress={() => coords && openMapsNavigation(coords[1], coords[0], donation.pickupLocation.address)}>
                <Ionicons name="location" size={22} color={COLORS.danger} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationText}>{donation.pickupLocation.address}</Text>
                  <Text style={{ color: COLORS.primary, fontSize: 11, marginTop: 2 }}>📍 Tap to open in Maps</Text>
                </View>
                <Ionicons name="navigate" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mission Actions</Text>

            {donation.status === 'ACCEPTED' && (
              <TouchableOpacity
                style={styles.otpBtn}
                onPress={() => navigation.navigate('PickupOTP', { donationId: donation._id })}
              >
                <Ionicons name="shield-checkmark" size={18} color={COLORS.white} />
                <Text style={styles.otpBtnText}>Verify Pickup OTP</Text>
              </TouchableOpacity>
            )}

            {donation.status === 'PICKED_UP' && (
              <TouchableOpacity
                style={[styles.deliverBtn, actionLoading && { opacity: 0.6 }]}
                onPress={handleCompleteDelivery}
                disabled={actionLoading}
              >
                <Ionicons name="checkmark-done-circle" size={18} color={COLORS.white} />
                <Text style={styles.deliverBtnText}>{actionLoading ? 'Processing...' : 'Mark Delivery Complete'}</Text>
              </TouchableOpacity>
            )}

            {donation.status === 'DELIVERED' && (
              <View style={styles.completedBox}>
                <Ionicons name="ribbon" size={28} color={COLORS.primary} />
                <Text style={styles.completedText}>Mission Completed! +50 Badge Points earned</Text>
              </View>
            )}

            {donation.status === 'PENDING' && (
              <Text style={styles.pendingNote}>This donation is still pending assignment.</Text>
            )}
          </View>

          {/* Notes */}
          {donation.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Donor Notes</Text>
              <Text style={styles.notesText}>{donation.notes}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Chip({ icon, label, color }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon + '-outline'} size={12} color={color || COLORS.textMuted} />
      <Text style={[styles.chipText, color && { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: COLORS.text, fontSize: 18, fontWeight: '800' },
  body: { padding: 18, gap: 20 },
  missionCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: 18, borderWidth: 1, borderColor: COLORS.cardBorder, gap: 12 },
  foodTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.inputBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.cardBorder },
  chipText: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  freshnessBar: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: COLORS.inputBg, borderRadius: RADIUS.lg, padding: 12 },
  freshnessLabel: { color: COLORS.textMuted, fontSize: 12 },
  freshnessValue: { color: COLORS.success, fontWeight: '800', fontSize: 16 },
  section: { gap: 10 },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 12, gap: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  contactName: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  contactPhone: { color: COLORS.textMuted, fontSize: 12 },
  callBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center' },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 14, gap: 10, borderWidth: 1, borderColor: COLORS.cardBorder },
  locationText: { color: COLORS.text, fontSize: 13 },
  otpBtn: { backgroundColor: COLORS.info, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8, ...SHADOW.card },
  otpBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  deliverBtn: { backgroundColor: COLORS.primaryDark, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8, ...SHADOW.green },
  deliverBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
  completedBox: { alignItems: 'center', gap: 8, padding: 20, backgroundColor: 'rgba(34,197,94,0.08)', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)' },
  completedText: { color: COLORS.primary, fontWeight: '700', fontSize: 14, textAlign: 'center' },
  pendingNote: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  notesText: { color: COLORS.textLight, fontSize: 13, lineHeight: 20 },
});
