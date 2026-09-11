import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { volunteerApi } from '../../api/volunteerApi';
import { COLORS, RADIUS, SHADOW } from '../../constants/colors';

export default function PickupOTPScreen({ navigation, route }) {
  const { donationId } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter the 6-digit pickup OTP from the donor.');
      return;
    }
    setLoading(true);
    try {
      await volunteerApi.verifyPickupOTP(donationId, otp.trim());
      Alert.alert('✅ Pickup Verified!', 'Food handover confirmed. Now deliver to the NGO.', [
        { text: 'View Mission', onPress: () => navigation.navigate('MissionDetail', { id: donationId }) },
      ]);
    } catch (err) {
      Alert.alert('Verification Failed', err.message || 'OTP is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.iconBox}>
          <Ionicons name="shield-checkmark" size={48} color={COLORS.white} />
        </View>

        <Text style={styles.title}>Pickup OTP Verification</Text>
        <Text style={styles.sub}>
          Ask the donor for the 6-digit OTP{'\n'}to confirm food handover
        </Text>

        <View style={styles.infoCard}>
          <Ionicons name="information-circle" size={16} color={COLORS.info} />
          <Text style={styles.infoText}>The donor received this OTP via email when you accepted the mission</Text>
        </View>

        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={setOtp}
          maxLength={6}
          keyboardType="number-pad"
          placeholder="000000"
          placeholderTextColor={COLORS.placeholder}
          textAlign="center"
        />

        <TouchableOpacity
          style={[styles.verifyBtn, loading && { opacity: 0.6 }]}
          onPress={handleVerify}
          disabled={loading}
        >
          <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
          <Text style={styles.verifyText}>{loading ? 'Verifying...' : 'Verify Pickup'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 10 }}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1, padding: 28, justifyContent: 'center', alignItems: 'center', gap: 16 },
  backBtn: { position: 'absolute', top: 16, left: 20, width: 38, height: 38, borderRadius: 10, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center' },
  iconBox: { width: 90, height: 90, borderRadius: 24, backgroundColor: COLORS.info, alignItems: 'center', justifyContent: 'center', ...SHADOW.card },
  title: { color: COLORS.text, fontSize: 22, fontWeight: '800', textAlign: 'center' },
  sub: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', lineHeight: 20 },
  infoCard: { flexDirection: 'row', gap: 8, backgroundColor: 'rgba(59,130,246,0.1)', padding: 12, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)', width: '100%' },
  infoText: { color: COLORS.info, fontSize: 11, flex: 1, lineHeight: 16 },
  otpInput: {
    width: '100%', borderWidth: 2, borderColor: COLORS.info,
    borderRadius: RADIUS.xl, padding: 18, color: COLORS.text,
    fontSize: 32, fontWeight: '900', letterSpacing: 10,
    backgroundColor: COLORS.inputBg,
  },
  verifyBtn: {
    width: '100%', backgroundColor: COLORS.info, borderRadius: RADIUS.lg,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 14, gap: 8, ...SHADOW.card,
  },
  verifyText: { color: COLORS.white, fontWeight: '700', fontSize: 16 },
  cancelText: { color: COLORS.textMuted, fontSize: 13 },
});
