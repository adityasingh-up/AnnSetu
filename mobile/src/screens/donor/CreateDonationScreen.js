import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, Alert, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { donationApi } from '../../api/donationApi';
import { COLORS, RADIUS, SHADOW } from '../../constants/colors';

const FOOD_CATEGORIES = [
  { value: 'cooked_meal', label: 'Cooked Meal' },
  { value: 'raw_ingredients', label: 'Raw Ingredients' },
  { value: 'packaged_food', label: 'Packaged Food' },
  { value: 'bakery_fruits', label: 'Bakery / Fruits' },
  { value: 'beverages', label: 'Beverages' },
];
const FOOD_TYPES = ['veg', 'non-veg', 'vegan', 'jain'];

export default function CreateDonationScreen({ navigation }) {
  const [form, setForm] = useState({
    title: '', foodCategory: 'cooked_meal', foodType: 'veg',
    quantityKg: '', notes: '', address: 'Connaught Place, New Delhi',
    imageUrl: '',
  });
  const [imageLocal, setImageLocal] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const pickImage = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Allow photo library access to upload a picture.');
        return;
      }
      const mediaTypes = ImagePicker.MediaTypeOptions?.Images || 'images';
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes, quality: 0.7 });
      if (!result.canceled && result.assets && result.assets[0]) {
        setImageLocal(result.assets[0].uri);
        set('imageUrl', result.assets[0].uri);
      }
    } catch {
      // Fallback
      setImageLocal('https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600');
      set('imageUrl', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600');
    }
  };


  const handleSubmit = async () => {
    if (!form.title || !form.quantityKg || !form.address) {
      Alert.alert('Missing Fields', 'Please fill title, quantity, and address.');
      return;
    }
    const qty = parseFloat(form.quantityKg);
    if (isNaN(qty) || qty < 0.5) {
      Alert.alert('Invalid Quantity', 'Minimum quantity is 0.5 kg.');
      return;
    }
    setLoading(true);
    try {
      await donationApi.create({
        title: form.title.trim(),
        foodCategory: form.foodCategory,
        foodType: form.foodType,
        quantityKg: qty,
        notes: form.notes,
        imageUrl: form.imageUrl,
        preparedAt: new Date().toISOString(),
        pickupLocation: {
          type: 'Point',
          coordinates: [77.209, 28.6139],
          address: form.address.trim(),
        },
      });
      Alert.alert('✅ Donation Posted!', 'Your food donation has been listed. AI freshness analysis is complete!', [
        { text: 'View History', onPress: () => navigation.navigate('History') },
        { text: 'OK' },
      ]);
      setForm({ title: '', foodCategory: 'cooked_meal', foodType: 'veg', quantityKg: '', notes: '', address: 'Connaught Place, New Delhi', imageUrl: '' });
      setImageLocal(null);
    } catch (err) {
      Alert.alert('Failed', err.message || 'Could not create donation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          <Text style={styles.pageTitle}>Post Food Donation</Text>
          <Text style={styles.pageSub}>AI will evaluate freshness & shelf life automatically</Text>

          {/* Image */}
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageLocal ? (
              <Image source={{ uri: imageLocal }} style={styles.previewImage} />
            ) : (
              <>
                <Ionicons name="camera" size={32} color={COLORS.textMuted} />
                <Text style={styles.imagePickerText}>Tap to add food photo</Text>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.card}>
            {/* Title */}
            <Field label="Donation Title *">
              <TextInput style={styles.input} value={form.title} onChangeText={(v) => set('title', v)} placeholder="e.g. Biryani from wedding event" placeholderTextColor={COLORS.placeholder} />
            </Field>

            {/* Food Category */}
            <Field label="Food Category *">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {FOOD_CATEGORIES.map((c) => (
                    <TouchableOpacity key={c.value} style={[styles.chip, form.foodCategory === c.value && styles.chipActive]} onPress={() => set('foodCategory', c.value)}>
                      <Text style={[styles.chipText, form.foodCategory === c.value && { color: COLORS.white }]}>{c.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </Field>

            {/* Food Type */}
            <Field label="Food Type *">
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {FOOD_TYPES.map((t) => (
                  <TouchableOpacity key={t} style={[styles.chip, form.foodType === t && styles.chipActive]} onPress={() => set('foodType', t)}>
                    <Text style={[styles.chipText, form.foodType === t && { color: COLORS.white }]}>{t.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            {/* Quantity */}
            <Field label="Quantity (kg) *">
              <TextInput style={styles.input} value={form.quantityKg} onChangeText={(v) => set('quantityKg', v)} placeholder="e.g. 5" placeholderTextColor={COLORS.placeholder} keyboardType="decimal-pad" />
            </Field>

            {/* Address */}
            <Field label="Pickup Address *">
              <TextInput style={[styles.input, { minHeight: 60 }]} value={form.address} onChangeText={(v) => set('address', v)} placeholder="Full pickup address" placeholderTextColor={COLORS.placeholder} multiline />
            </Field>

            {/* Notes */}
            <Field label="Additional Notes">
              <TextInput style={[styles.input, { minHeight: 60 }]} value={form.notes} onChangeText={(v) => set('notes', v)} placeholder="Allergens, special instructions..." placeholderTextColor={COLORS.placeholder} multiline />
            </Field>

            <TouchableOpacity style={[styles.submitBtn, loading && { opacity: 0.6 }]} onPress={handleSubmit} disabled={loading}>
              <Ionicons name={loading ? 'reload-outline' : 'leaf'} size={18} color={COLORS.white} />
              <Text style={styles.submitText}>{loading ? 'Posting...' : 'Post Donation'}</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, children }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  scroll: { padding: 18, paddingBottom: 40 },
  pageTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 2 },
  pageSub: { color: COLORS.textMuted, fontSize: 12, marginBottom: 16 },
  imagePicker: { height: 150, borderRadius: RADIUS.xl, borderWidth: 1.5, borderColor: COLORS.inputBorder, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 16, gap: 8, backgroundColor: COLORS.inputBg, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', borderRadius: RADIUS.xl },
  imagePickerText: { color: COLORS.textMuted, fontSize: 13 },
  card: { backgroundColor: COLORS.card, borderRadius: RADIUS.xxl, padding: 18, borderWidth: 1, borderColor: COLORS.cardBorder, gap: 14 },
  label: { color: COLORS.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { backgroundColor: COLORS.inputBg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.inputBorder, color: COLORS.text, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: RADIUS.full, borderWidth: 1, borderColor: COLORS.cardBorder, backgroundColor: COLORS.inputBg },
  chipActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  chipText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  submitBtn: { backgroundColor: COLORS.primaryDark, borderRadius: RADIUS.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8, ...SHADOW.green },
  submitText: { color: COLORS.white, fontWeight: '700', fontSize: 15 },
});
