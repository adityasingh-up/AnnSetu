import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ngoApi } from '../../api/ngoApi';
import StatusBadge from '../../components/StatusBadge';
import { COLORS, RADIUS, SHADOW } from '../../constants/colors';

export default function DistributionScreen({ navigation, route }) {
  const { donation } = route.params || {};
  const [beneficiaryCount, setBeneficiaryCount] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  if (!donation) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ color: COLORS.danger, padding: 20 }}>No donation selected</Text>
      </SafeAreaView>
    );
  }

  const handleDistribute = async () => {
    const count = parseInt(beneficiaryCount);
    if (!count || count < 1) {
      Alert.alert('Invalid', 'Please enter the number of beneficiaries served.');
      return;
    }
    setLoading(true);
    try {
      await ngoApi.markDistributed(donation._id, count, notes.trim());
      Alert.alert(
        '🎉 Distribution Recorded!',
        `${donation.quantityKg} kg food distributed to ${count} beneficiaries.`,
        [{ text: 'Back to Inventory', onPress: () => navigation.navigate('NGOTabs') }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not record distribution.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Record Distribution</Text>
        </View>

        {/* Donation Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTitle}>{donation.title}</Text>
            <StatusBadge status={donation.status} size="sm" />
          </View>
          <View style={styles.metaRow}>
            <InfoChip icon="scale" text={`${donation.quantityKg} kg`} />
            <InfoChip icon="people" text={`${donation.servingsCount} meals`} />
            <InfoChip icon="leaf" text={donation.foodType} />
          </View>
          {donation.donorId?.name && (
            <Text style={styles.donorText}>Donated by: {donation.donorId.name}</Text>
          )}
        </View>

        {/* Distribution Form */}
        <View style={styles.formCard}>
          <View style={styles.iconHeader}>
            <View style={styles.formIconBox}>
              <Ionicons name="people-circle" size={36} color={COLORS.white} />
            </View>
            <Text style={styles.formTitle}>Distribution Details</Text>
            <Text style={styles.formSub}>Record how many people received this food</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Number of Beneficiaries *</Text>
            <TextInput
              style={styles.input}
              value={beneficiaryCount}
              onChangeText={setBeneficiaryCount}
              keyboardType="number-pad"
              placeholder="e.g. 50"
              placeholderTextColor={COLORS.placeholder}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Distribution Notes</Text>
            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: 'top' }]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Location, type of beneficiaries, special notes..."
              placeholderTextColor={COLORS.placeholder}
              multiline
            />
          </View>

          <TouchableOpacity
            style={[styles.distributeBtn, loading && { opacity: 0.6 }]}
            onPress={handleDistribute}
            disabled={loading}
          >
            <Ionicons name="checkmark-done-circle" size={20} color={COLORS.white} />
            <Text style={styles.distributeBtnText}>
              {loading ? 'Recording...' : 'Confirm Distribution'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoChip({ icon, text }) {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon + '-outline'} size={12} color={COLORS.textMuted} />
      <Text style={styles.chipText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  backBtn: { width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  summaryCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xl, padding: 16, gap: 10, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTitle: { color: COLORS.text, fontSize: 16, fontWeight: '700', flex: 1 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.inputBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: RADIUS.full },
  chipText: { color: COLORS.textMuted, fontSize: 11, textTransform: 'capitalize' },
  donorText: { color: COLORS.textMuted, fontSize: 11 },
  formCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, padding: 20, gap: 16, borderWidth: 1, borderColor: COLORS.cardBorder },
  iconHeader: { alignItems: 'center', gap: 6 },
  formIconBox: { width: 64, height: 64, borderRadius: 18, backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center', ...SHADOW.green },
  formTitle: { color: COLORS.text, fontSize: 18, fontWeight: '800' },
  formSub: { color: COLORS.textMuted, fontSize: 12, textAlign: 'center' },
  field: { gap: 6 },
  label: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.inputBg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.inputBorder, color: COLORS.text, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  distributeBtn: { backgroundColor: COLORS.primaryDark, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8, ...SHADOW.green },
  distributeBtnText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
