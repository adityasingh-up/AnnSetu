import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { donationApi } from '../../api/donationApi';
import StatusBadge from '../../components/StatusBadge';
import LoadingSpinner from '../../components/LoadingSpinner';
import { COLORS, RADIUS, SHADOW } from '../../constants/colors';
import { formatDateTime, timeUntil, openMapsNavigation } from '../../utils/helpers';

const STATUS_STEPS = ['PENDING', 'ACCEPTED', 'PICKED_UP', 'DELIVERED'];

export default function DonationDetailScreen({ navigation, route }) {
  const { id } = route.params;
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    donationApi.getById(id).then((res) => {
      setDonation(res?.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading details..." />;
  if (!donation) return <View style={styles.safe}><Text style={{ color: COLORS.danger, padding: 20 }}>Donation not found</Text></View>;

  const currentStep = STATUS_STEPS.indexOf(donation.status);
  const coords = donation.pickupLocation?.coordinates;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView>
        {/* Header Image */}
        <View style={{ position: 'relative' }}>
          <Image source={{ uri: donation.imageUrl }} style={styles.heroImage} />
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.white} />
          </TouchableOpacity>
          <View style={styles.freshnessOverlay}>
            <Text style={styles.freshnessText}>🌿 {donation.freshnessScore}% Fresh · {timeUntil(donation.expiryTime)}</Text>
          </View>
        </View>

        <View style={styles.body}>
          {/* Title & Status */}
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={2}>{donation.title}</Text>
            <StatusBadge status={donation.status} />
          </View>

          {/* Meta chips */}
          <View style={styles.metaRow}>
            <MetaInfo icon="scale" label={`${donation.quantityKg} kg`} />
            <MetaInfo icon="people" label={`${donation.servingsCount} meals`} />
            <MetaInfo icon="leaf" label={donation.foodType} />
            <MetaInfo icon="restaurant" label={donation.foodCategory?.replace('_', ' ')} />
          </View>

          {/* Timeline */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rescue Progress</Text>
            <View style={styles.timeline}>
              {STATUS_STEPS.map((step, idx) => {
                const done = idx <= currentStep;
                return (
                  <View key={step} style={styles.timelineItem}>
                    <View style={[styles.timelineDot, done && styles.timelineDotDone]}>
                      {done && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                    </View>
                    {idx < STATUS_STEPS.length - 1 && <View style={[styles.timelineLine, done && styles.timelineLineDone]} />}
                    <Text style={[styles.timelineLabel, done && { color: COLORS.primary }]}>{step.replace('_', ' ')}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Pickup Handover OTP Card */}
          {donation.pickupOtp && ['PENDING', 'ACCEPTED'].includes(donation.status) && (
            <View style={styles.otpCard}>
              <View style={styles.otpHeader}>
                <Ionicons name="key" size={20} color={COLORS.primary} />
                <Text style={styles.otpTitle}>Pickup Verification OTP</Text>
              </View>
              <Text style={styles.otpSub}>
                Share this 6-digit handover code with the volunteer when they arrive for pickup:
              </Text>
              <View style={styles.otpCodeBox}>
                <Text style={styles.otpCodeText}>{donation.pickupOtp}</Text>
              </View>
            </View>
          )}

          {/* Location */}
          {donation.pickupLocation?.address && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pickup Location</Text>
              <TouchableOpacity
                style={styles.locationCard}
                onPress={() => coords && openMapsNavigation(coords[1], coords[0], donation.pickupLocation.address)}
              >
                <Ionicons name="location" size={22} color={COLORS.danger} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.locationText}>{donation.pickupLocation.address}</Text>
                  <Text style={{ color: COLORS.primary, fontSize: 11, marginTop: 2 }}>Tap to navigate →</Text>
                </View>
                <Ionicons name="navigate" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          )}

          {/* Volunteer Info */}
          {donation.volunteerId && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Assigned Volunteer</Text>
              <View style={styles.personCard}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{donation.volunteerId?.name?.[0]}</Text></View>
                <View>
                  <Text style={styles.personName}>{donation.volunteerId.name}</Text>
                  <Text style={styles.personSub}>{donation.volunteerId.vehicleType} · ⭐ {donation.volunteerId.rating}</Text>
                </View>
                <TouchableOpacity style={styles.callBtn} onPress={() => Linking.openURL(`tel:${donation.volunteerId.phone}`)}>
                  <Ionicons name="call" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Notes */}
          {donation.notes && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Notes</Text>
              <Text style={styles.notesText}>{donation.notes}</Text>
            </View>
          )}

          {/* Timestamps */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Timeline</Text>
            <Text style={styles.tsRow}>Posted: {formatDateTime(donation.createdAt)}</Text>
            <Text style={styles.tsRow}>Expires: {formatDateTime(donation.expiryTime)}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MetaInfo({ icon, label }) {
  return (
    <View style={styles.metaChip}>
      <Ionicons name={icon + '-outline'} size={13} color={COLORS.textMuted} />
      <Text style={styles.metaChipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  heroImage: { width: '100%', height: 240 },
  backBtn: { position: 'absolute', top: 50, left: 16, width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  freshnessOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)' },
  freshnessText: { color: COLORS.primary, fontWeight: '700', fontSize: 12 },
  body: { padding: 18, gap: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  title: { flex: 1, color: COLORS.text, fontSize: 20, fontWeight: '800' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.card, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.cardBorder },
  metaChipText: { color: COLORS.textMuted, fontSize: 11, textTransform: 'capitalize' },
  section: { gap: 10 },
  sectionTitle: { color: COLORS.text, fontSize: 14, fontWeight: '700' },
  timeline: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  timelineItem: { alignItems: 'center', flex: 1, gap: 4 },
  timelineDot: { width: 28, height: 28, borderRadius: 14, backgroundColor: COLORS.card, borderWidth: 2, borderColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center' },
  timelineDotDone: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  timelineLine: { position: 'absolute', top: 13, left: '60%', right: '-60%', height: 2, backgroundColor: COLORS.cardBorder },
  timelineLineDone: { backgroundColor: COLORS.primaryDark },
  timelineLabel: { color: COLORS.textMuted, fontSize: 9, fontWeight: '600', textAlign: 'center', textTransform: 'capitalize' },
  locationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 14, gap: 10, borderWidth: 1, borderColor: COLORS.cardBorder },
  locationText: { color: COLORS.text, fontSize: 13 },
  personCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.lg, padding: 12, gap: 12, borderWidth: 1, borderColor: COLORS.cardBorder },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  personName: { color: COLORS.text, fontWeight: '700', fontSize: 14 },
  personSub: { color: COLORS.textMuted, fontSize: 11, textTransform: 'capitalize' },
  callBtn: { marginLeft: 'auto', width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center' },
  notesText: { color: COLORS.textLight, fontSize: 13, lineHeight: 20 },
  tsRow: { color: COLORS.textMuted, fontSize: 12 },
  otpCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(34,197,94,0.3)',
    gap: 8,
  },
  otpHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  otpTitle: { color: COLORS.primary, fontSize: 15, fontWeight: '800' },
  otpSub: { color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
  otpCodeBox: {
    backgroundColor: 'rgba(34,197,94,0.12)',
    borderRadius: RADIUS.lg,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    marginTop: 4,
  },
  otpCodeText: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 6,
    fontVariant: ['tabular-nums'],
  },
});
