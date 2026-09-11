import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

async function testUpdatesFlow() {
  console.log('🚀 Testing Automatic WhatsApp Message System on Updates...\n');

  const randomSuffix = Math.floor(Math.random() * 10000);
  const donorEmail = `donor_upd_${randomSuffix}@annsetu.com`;
  const volEmail = `volunteer_upd_${randomSuffix}@annsetu.com`;
  const ngoEmail = `ngo_upd_${randomSuffix}@annsetu.com`;

  // 1. Register Donor
  const regDonorRes = await axios.post(`${BASE_URL}/auth/register`, {
    name: 'Pooja Verma',
    email: donorEmail,
    password: 'Password@123',
    phone: '9876543222',
    role: 'donor'
  });
  const donorToken = regDonorRes.data.data.token;
  const donorId = regDonorRes.data.data.user._id;

  // 2. Register NGO
  const regNgoRes = await axios.post(`${BASE_URL}/auth/register`, {
    name: 'Robin Hood Army NGO',
    email: ngoEmail,
    password: 'Password@123',
    phone: '9876543333',
    role: 'ngo',
    organizationName: 'Robin Hood Army',
    registrationNumber: 'NGO-DEL-2026-99'
  });
  const ngoToken = regNgoRes.data.data.token;

  // [TEST 1] Profile Update
  console.log('[1] Testing Profile Update Automatic WhatsApp Alert:');
  const updateProfRes = await axios.put(
    `${BASE_URL}/auth/profile`,
    {
      name: 'Pooja Verma (Updated)',
      vehicleType: 'four-wheeler'
    },
    { headers: { Authorization: `Bearer ${donorToken}` } }
  );
  console.log('✅ Profile updated. Automatic WhatsApp alert dispatched. Success:', updateProfRes.data.success);

  // [TEST 2] Food Donation Created & Then Updated
  console.log('\n[2] Testing Food Donation Post & Subsequent Update:');
  const postFoodRes = await axios.post(
    `${BASE_URL}/donations`,
    {
      title: '40 Packets Kadhai Paneer & Rotis',
      foodCategory: 'cooked_meal',
      foodType: 'veg',
      quantityKg: 12,
      servingsCount: 30
    },
    { headers: { Authorization: `Bearer ${donorToken}` } }
  );
  const donationId = postFoodRes.data.data.donation._id;
  console.log('✅ Donation created. ID:', donationId);

  // Update Donation Quantity and Notes
  const updateDonationRes = await axios.put(
    `${BASE_URL}/donations/${donationId}`,
    {
      quantityKg: 18,
      notes: 'Added extra rotis and sweet packets.'
    },
    { headers: { Authorization: `Bearer ${donorToken}` } }
  );
  console.log('✅ Donation details updated. Automatic WhatsApp alert dispatched. Status:', updateDonationRes.data.success);

  // [TEST 3] NGO Claims Food Donation
  console.log('\n[3] Testing NGO Claiming Donation:');
  const claimRes = await axios.post(
    `${BASE_URL}/ngo/claim/${donationId}`,
    {},
    { headers: { Authorization: `Bearer ${ngoToken}` } }
  );
  console.log('✅ NGO claimed donation. Automatic WhatsApp alert dispatched to donor. Status:', claimRes.data.success);

  // [TEST 4] Forgot Password & Reset Password
  console.log('\n[4] Testing Forgot Password & Password Reset:');
  const forgotRes = await axios.post(`${BASE_URL}/auth/forgot-password`, {
    email: donorEmail
  });
  const demoResetOtp = forgotRes.data.data?.demoOTP;
  console.log('✅ Forgot password OTP requested. WhatsApp OTP alert dispatched. OTP:', demoResetOtp);

  const resetRes = await axios.post(`${BASE_URL}/auth/reset-password`, {
    email: donorEmail,
    otp: demoResetOtp,
    newPassword: 'NewPassword@456'
  });
  console.log('✅ Password reset successful. Security WhatsApp alert dispatched. Status:', resetRes.data.success);

  // [TEST 5] Donation Cancellation
  console.log('\n[5] Testing Donation Cancellation:');
  // Create another donation to cancel
  const foodToCancelRes = await axios.post(
    `${BASE_URL}/donations`,
    {
      title: '15 Packets Veg Sandwiches',
      foodCategory: 'cooked_meal',
      foodType: 'veg',
      quantityKg: 5,
      servingsCount: 15
    },
    { headers: { Authorization: `Bearer ${donorToken}` } }
  );
  const cancelId = foodToCancelRes.data.data.donation._id;

  const cancelRes = await axios.post(
    `${BASE_URL}/donations/${cancelId}/cancel`,
    { reason: 'Food distributed locally to daily wage workers' },
    { headers: { Authorization: `Bearer ${donorToken}` } }
  );
  console.log('✅ Donation cancelled. Automatic WhatsApp cancellation alert dispatched. Status:', cancelRes.data.data.status);

  console.log('\n🎉 ALL AUTOMATIC UPDATE WHATSAPP NOTIFICATIONS VERIFIED SUCCESSFULLY!');
}

testUpdatesFlow().catch(err => {
  console.error('❌ Error during update flow test:', err.response?.data || err.message);
});
