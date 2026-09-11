import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Image, ActivityIndicator, Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS, RADIUS, SHADOW } from '../../constants/colors';
import { getRoleLabel, getInitials } from '../../utils/helpers';

const VEHICLE_OPTIONS = [
  { label: 'Two Wheeler (Bike/Scooter)', value: 'two-wheeler', icon: 'bicycle-outline' },
  { label: 'Three Wheeler (Auto)', value: 'three-wheeler', icon: 'car-sport-outline' },
  { label: 'Four Wheeler (Car)', value: 'four-wheeler', icon: 'car-outline' },
  { label: 'Delivery Van', value: 'van', icon: 'bus-outline' },
  { label: 'None (Walking/Public)', value: 'none', icon: 'walk-outline' },
];

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200',
];

export default function ProfileScreen() {
  const { user, updateProfile, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form states
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.location?.address || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [orgName, setOrgName] = useState(user?.organizationName || '');
  const [regNum, setRegNum] = useState(user?.registrationNumber || '');
  const [vehicle, setVehicle] = useState(user?.vehicleType || 'none');
  const [isOnline, setIsOnline] = useState(user?.isOnline !== false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.location?.address || '');
      setAvatar(user.avatar || '');
      setOrgName(user.organizationName || '');
      setRegNum(user.registrationNumber || '');
      setVehicle(user.vehicleType || 'none');
      setIsOnline(user.isOnline !== false);
    }
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Full Name cannot be empty.');
      return;
    }
    if (!phone.trim()) {
      Alert.alert('Validation Error', 'Phone Number cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        avatar: avatar,
        address: address.trim(),
      };

      if (user?.role === 'ngo') {
        payload.organizationName = orgName.trim();
        payload.registrationNumber = regNum.trim();
      }

      if (user?.role === 'volunteer') {
        payload.vehicleType = vehicle;
        payload.isOnline = isOnline;
      }

      const updated = await updateProfile(payload);
      Alert.alert('✅ Success', 'Your profile details have been updated successfully.');
      setEditing(false);
    } catch (err) {
      Alert.alert('Update Failed', err.message || 'Could not update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setAddress(user?.location?.address || '');
    setAvatar(user?.avatar || '');
    setOrgName(user?.organizationName || '');
    setRegNum(user?.registrationNumber || '');
    setVehicle(user?.vehicleType || 'none');
    setIsOnline(user?.isOnline !== false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBar}>
          <Text style={styles.pageTitle}>Account Profile</Text>
          {!editing ? (
            <TouchableOpacity style={styles.topEditBtn} onPress={() => setEditing(true)}>
              <Ionicons name="create-outline" size={16} color={COLORS.primary} />
              <Text style={styles.topEditText}>Edit Profile</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleCancel}>
              <Text style={styles.topCancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Avatar Card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatarContainer}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials}>{getInitials(name || user?.name)}</Text>
              </View>
            )}
            {editing && (
              <View style={styles.avatarEditBadge}>
                <Ionicons name="camera" size={14} color={COLORS.white} />
              </View>
            )}
          </View>

          {editing && (
            <View style={styles.presetAvatarSection}>
              <Text style={styles.presetLabel}>Select Profile Avatar:</Text>
              <View style={styles.presetRow}>
                {PRESET_AVATARS.map((uri, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.presetThumbWrap, avatar === uri && styles.presetActive]}
                    onPress={() => setAvatar(uri)}
                  >
                    <Image source={{ uri }} style={styles.presetThumb} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Text style={styles.userName}>{name || user?.name}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.badgesRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{getRoleLabel(user?.role)}</Text>
            </View>
            {user?.isVerified && (
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            )}
          </View>
        </View>

        {/* Profile Form Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardSectionTitle}>Personal Information</Text>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            {editing ? (
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter full name"
                placeholderTextColor={COLORS.placeholder}
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.name || '—'}</Text>
            )}
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Phone Number</Text>
            {editing ? (
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 9876543210"
                keyboardType="phone-pad"
                placeholderTextColor={COLORS.placeholder}
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.phone || '—'}</Text>
            )}
          </View>

          {/* Email (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Email Address</Text>
            <Text style={[styles.fieldValue, { color: COLORS.textMuted }]}>{user?.email || '—'}</Text>
          </View>

          {/* Location / Address */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Pickup / Registered Address</Text>
            {editing ? (
              <TextInput
                style={[styles.textInput, { minHeight: 60, textAlignVertical: 'top' }]}
                value={address}
                onChangeText={setAddress}
                placeholder="Enter complete address, landmark, city"
                multiline
                numberOfLines={2}
                placeholderTextColor={COLORS.placeholder}
              />
            ) : (
              <Text style={styles.fieldValue}>{user?.location?.address || '—'}</Text>
            )}
          </View>

          {/* Role-Specific Fields */}
          {user?.role === 'ngo' && (
            <>
              <View style={styles.divider} />
              <Text style={styles.cardSectionTitle}>NGO Organization Details</Text>

              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Organization Name</Text>
                {editing ? (
                  <TextInput
                    style={styles.textInput}
                    value={orgName}
                    onChangeText={setOrgName}
                    placeholder="E.g. Robin Hood Army / Roti Bank"
                    placeholderTextColor={COLORS.placeholder}
                  />
                ) : (
                  <Text style={styles.fieldValue}>{user?.organizationName || '—'}</Text>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Registration / Darpan Number</Text>
                {editing ? (
                  <TextInput
                    style={styles.textInput}
                    value={regNum}
                    onChangeText={setRegNum}
                    placeholder="E.g. REG-12345/NGO"
                    placeholderTextColor={COLORS.placeholder}
                  />
                ) : (
                  <Text style={styles.fieldValue}>{user?.registrationNumber || '—'}</Text>
                )}
              </View>
            </>
          )}

          {user?.role === 'volunteer' && (
            <>
              <View style={styles.divider} />
              <Text style={styles.cardSectionTitle}>Volunteer Vehicle & Duty Status</Text>

              {/* Duty Status Switch */}
              <View style={styles.switchRow}>
                <View>
                  <Text style={styles.fieldLabel}>Active Duty Status</Text>
                  <Text style={styles.subHint}>
                    {isOnline ? '🟢 Online (Receiving food rescue alerts)' : '🔴 Offline (On Break)'}
                  </Text>
                </View>
                <Switch
                  value={isOnline}
                  onValueChange={setIsOnline}
                  disabled={!editing}
                  trackColor={{ false: COLORS.danger, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>

              {/* Vehicle Type Selection */}
              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Delivery Vehicle</Text>
                {editing ? (
                  <View style={styles.vehicleOptionsWrap}>
                    {VEHICLE_OPTIONS.map((v) => (
                      <TouchableOpacity
                        key={v.value}
                        style={[styles.vehicleChip, vehicle === v.value && styles.vehicleChipActive]}
                        onPress={() => setVehicle(v.value)}
                      >
                        <Ionicons
                          name={v.icon}
                          size={16}
                          color={vehicle === v.value ? COLORS.white : COLORS.textMuted}
                        />
                        <Text
                          style={[styles.vehicleChipText, vehicle === v.value && styles.vehicleChipTextActive]}
                        >
                          {v.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.fieldValue}>
                    {VEHICLE_OPTIONS.find((v) => v.value === user?.vehicleType)?.label || user?.vehicleType || 'None'}
                  </Text>
                )}
              </View>

              <View style={styles.volunteerStatsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxNum}>⭐ {user?.rating || 5.0}</Text>
                  <Text style={styles.statBoxLabel}>Rating</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statBoxNum}>{user?.badgePoints || 100} pts</Text>
                  <Text style={styles.statBoxLabel}>Badge Points</Text>
                </View>
              </View>
            </>
          )}

          {/* Edit Actions */}
          {editing && (
            <View style={styles.editButtonsRow}>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                    <Text style={styles.saveBtnText}>Save Profile Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            Alert.alert('Logout?', 'Are you sure you want to sign out from AnnSetu?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Logout', style: 'destructive', onPress: logout },
            ]);
          }}
        >
          <Ionicons name="log-out-outline" size={18} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out from Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18, paddingBottom: 40 },
  headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  pageTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800' },
  topEditBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(34,197,94,0.12)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.md },
  topEditText: { color: COLORS.primary, fontSize: 13, fontWeight: '700' },
  topCancelText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  avatarCard: { alignItems: 'center', backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, padding: 22, marginBottom: 16, borderWidth: 1, borderColor: COLORS.cardBorder },
  avatarContainer: { position: 'relative', marginBottom: 10 },
  avatarImg: { width: 84, height: 84, borderRadius: 42 },
  avatarPlaceholder: { width: 84, height: 84, borderRadius: 42, backgroundColor: COLORS.primaryDark, alignItems: 'center', justifyContent: 'center' },
  avatarInitials: { color: COLORS.white, fontSize: 30, fontWeight: '800' },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: COLORS.card },
  presetAvatarSection: { marginVertical: 12, alignItems: 'center', width: '100%' },
  presetLabel: { color: COLORS.textMuted, fontSize: 12, marginBottom: 8, fontWeight: '600' },
  presetRow: { flexDirection: 'row', gap: 10, justifyContent: 'center' },
  presetThumbWrap: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: 'transparent', overflow: 'hidden' },
  presetActive: { borderColor: COLORS.primary },
  presetThumb: { width: '100%', height: '100%' },
  userName: { color: COLORS.text, fontSize: 20, fontWeight: '800' },
  userEmail: { color: COLORS.textMuted, fontSize: 13, marginTop: 2 },
  badgesRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  roleBadge: { backgroundColor: 'rgba(34,197,94,0.15)', paddingHorizontal: 14, paddingVertical: 4, borderRadius: RADIUS.full },
  roleBadgeText: { color: COLORS.primary, fontSize: 12, fontWeight: '700' },
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(34,197,94,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: RADIUS.full },
  verifiedText: { color: COLORS.success, fontSize: 11, fontWeight: '600' },
  infoCard: { backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, padding: 18, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 16, gap: 14 },
  cardSectionTitle: { color: COLORS.primary, fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  inputGroup: { gap: 6 },
  fieldLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  fieldValue: { color: COLORS.text, fontSize: 14, fontWeight: '600', paddingVertical: 2 },
  textInput: { backgroundColor: COLORS.inputBg, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.inputBorder, color: COLORS.text, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  divider: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: 4 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  subHint: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  vehicleOptionsWrap: { gap: 8, marginTop: 4 },
  vehicleChip: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 14, borderRadius: RADIUS.lg, backgroundColor: COLORS.inputBg, borderWidth: 1, borderColor: COLORS.cardBorder },
  vehicleChipActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primary },
  vehicleChipText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600' },
  vehicleChipTextActive: { color: COLORS.white, fontWeight: '700' },
  volunteerStatsRow: { flexDirection: 'row', gap: 12, marginTop: 6 },
  statBox: { flex: 1, backgroundColor: COLORS.inputBg, borderRadius: RADIUS.lg, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  statBoxNum: { color: COLORS.text, fontSize: 16, fontWeight: '800' },
  statBoxLabel: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  editButtonsRow: { marginTop: 10 },
  saveBtn: { backgroundColor: COLORS.primaryDark, borderRadius: RADIUS.xl, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, ...SHADOW.green },
  saveBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: RADIUS.xl, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  logoutText: { color: COLORS.danger, fontWeight: '700', fontSize: 14 },
});
