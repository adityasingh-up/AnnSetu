import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS } from '../constants/colors';
import { getStatusLabel } from '../utils/helpers';

const STATUS_COLORS = {
  PENDING: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  ACCEPTED: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
  PICKED_UP: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6' },
  DELIVERED: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
  EXPIRED: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
  CANCELLED: { bg: 'rgba(107,114,128,0.15)', text: '#6b7280' },
};

export default function StatusBadge({ status, size = 'md' }) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.PENDING;
  const isSmall = size === 'sm';

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, isSmall && styles.badgeSm]}>
      <View style={[styles.dot, { backgroundColor: colors.text }]} />
      <Text style={[styles.text, { color: colors.text }, isSmall && styles.textSm]}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 5,
  },
  badgeSm: {
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 10,
  },
});
