import React from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, SHADOW, FONTS } from '../constants/colors';
import StatusBadge from './StatusBadge';
import { timeUntil, formatDateTime } from '../utils/helpers';

export default function DonationCard({ donation, onPress, showActions, onAccept }) {
  const { title, foodCategory, foodType, quantityKg, servingsCount,
    status, pickupLocation, freshnessScore, expiryTime, imageUrl, donorId } = donation;

  const freshColor = freshnessScore >= 80 ? COLORS.success :
    freshnessScore >= 50 ? COLORS.warning : COLORS.danger;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={{ uri: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.freshnessBar}>
        <Text style={[styles.freshnessText, { color: freshColor }]}>
          🌿 {freshnessScore}% Fresh · {timeUntil(expiryTime)}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <StatusBadge status={status} size="sm" />
        </View>

        <View style={styles.metaRow}>
          <MetaChip icon="scale" label={`${quantityKg} kg`} />
          <MetaChip icon="people" label={`${servingsCount} meals`} />
          <MetaChip icon="leaf" label={foodType} />
        </View>

        {pickupLocation?.address && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={COLORS.textMuted} />
            <Text style={styles.location} numberOfLines={1}>{pickupLocation.address}</Text>
          </View>
        )}

        {donorId?.name && (
          <Text style={styles.donor}>by {donorId.name}</Text>
        )}

        {showActions && status === 'PENDING' && (
          <TouchableOpacity style={styles.acceptBtn} onPress={onAccept}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.white} />
            <Text style={styles.acceptText}>Accept Rescue Mission</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

function MetaChip({ icon, label }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon + '-outline'} size={11} color={COLORS.textMuted} />
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    marginBottom: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    ...SHADOW.card,
  },
  image: {
    width: '100%',
    height: 160,
  },
  freshnessBar: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.3)',
    position: 'absolute',
    top: 130,
    width: '100%',
  },
  freshnessText: {
    fontSize: 11,
    fontWeight: '700',
  },
  body: {
    padding: 14,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
    marginRight: 8,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
    gap: 3,
  },
  chipText: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    color: COLORS.textMuted,
    fontSize: 12,
    flex: 1,
  },
  donor: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  acceptBtn: {
    marginTop: 4,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    gap: 6,
    ...SHADOW.green,
  },
  acceptText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 14,
  },
});
