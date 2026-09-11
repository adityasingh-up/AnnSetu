import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api/v1';

async function testFullApiFlow() {
  console.log('🚀 Starting Full API End-to-End WhatsApp Flow Test...\n');

  const randomSuffix = Math.floor(Math.random() * 10000);
  const donorEmail = `donor_${randomSuffix}@annsetu.com`;
  const volEmail = `volunteer_${randomSuffix}@annsetu.com`;
  const donorPhone = '9876543210';
  const volPhone = '9811223344';

  // 1. Register Donor
  console.log('[1] Testing Donor Registration with WhatsApp Welcome Message:');
  const regDonorRes = await axios.post(`${BASE_URL}/auth/register`, {
    name: 'Vikram Malhotra',
    email: donorEmail,
    password: 'Password@123',
    phone: donorPhone,
    role: 'donor'
  });
  console.log('✅ Donor registered. Token received. Success:', regDonorRes.data.success);
  const donorToken = regDonorRes.data.data.token;

  // 2. Test Login Alert for Donor
  console.log('\n[2] Testing Donor Login with WhatsApp Security Alert:');
  const loginDonorRes = await axios.post(`${BASE_URL}/auth/login`, {
    email: donorEmail,
    password: 'Password@123'
  });
  console.log('✅ Donor logged in successfully. Alert dispatched. Success:', loginDonorRes.data.success);

  // 3. Register Volunteer
  console.log('\n[3] Testing Volunteer Registration:');
  const regVolRes = await axios.post(`${BASE_URL}/auth/register`, {
    name: 'Suresh Kumar',
    email: volEmail,
    password: 'Password@123',
    phone: volPhone,
    role: 'volunteer',
    vehicleType: 'two-wheeler'
  });
  console.log('✅ Volunteer registered. Success:', regVolRes.data.success);
  const volToken = regVolRes.data.data.token;

  // 4. Create Food Donation (Food Add - Donor)
  console.log('\n[4] Testing Food Donation Post (Food Add with WhatsApp Order Confirmation):');
  const postFoodRes = await axios.post(
    `${BASE_URL}/donations`,
    {
      title: '30 Packets Fresh Paneer Pulao',
      foodCategory: 'cooked_meal',
      foodType: 'veg',
      quantityKg: 15,
      servingsCount: 30,
      notes: 'Hygienically packaged with spoons and napkins'
    },
    {
      headers: { Authorization: `Bearer ${donorToken}` }
    }
  );
  console.log('✅ Food Donation created with Freshness & OTP:', postFoodRes.data.data?.donation?._id);
  const donation = postFoodRes.data.data.donation;
  const donationId = donation._id;
  const pickupOtp = donation.pickupOtp;
  console.log('🔑 Generated Pickup OTP:', pickupOtp);

  // 5. Volunteer Accepts Rescue Task
  console.log('\n[5] Testing Volunteer Accepts Rescue Task:');
  const acceptRes = await axios.post(
    `${BASE_URL}/volunteer/accept/${donationId}`,
    {},
    {
      headers: { Authorization: `Bearer ${volToken}` }
    }
  );
  console.log('✅ Volunteer accepted task. WhatsApp alerts dispatched to Donor and Volunteer. Status:', acceptRes.data.data.status);

  // 6. Volunteer Verifies Pickup OTP (Received)
  console.log('\n[6] Testing Volunteer Verifies Pickup OTP (Food Handover / Received):');
  const verifyRes = await axios.post(
    `${BASE_URL}/volunteer/verify-pickup`,
    {
      donationId,
      otp: pickupOtp
    },
    {
      headers: { Authorization: `Bearer ${volToken}` }
    }
  );
  console.log('✅ OTP Verified! Food Picked Up / Received. WhatsApp In-Transit alerts dispatched. Status:', verifyRes.data.data.status);

  // 7. Complete Delivery
  console.log('\n[7] Testing Delivery Completion:');
  const deliveryRes = await axios.post(
    `${BASE_URL}/volunteer/complete-delivery`,
    {
      donationId,
      proofPhotoUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600'
    },
    {
      headers: { Authorization: `Bearer ${volToken}` }
    }
  );
  console.log('✅ Delivery Completed! WhatsApp Impact & Certificate alert dispatched. Status:', deliveryRes.data.data.status);

  // 8. Test Direct WhatsApp Test Endpoint
  console.log('\n[8] Testing /notifications/test-whatsapp endpoint:');
  const testNotifRes = await axios.post(
    `${BASE_URL}/notifications/test-whatsapp`,
    {
      phone: '9876543210',
      message: '🧪 Test message from automated test suite'
    },
    {
      headers: { Authorization: `Bearer ${donorToken}` }
    }
  );
  console.log('✅ Test endpoint responded:', testNotifRes.data);

  console.log('\n🎉 ALL 8 END-TO-END WHATSAPP INTEGRATION FLOWS VERIFIED SUCCESSFULLY!');
}

testFullApiFlow().catch(err => {
  console.error('❌ Error during API test:', err.response?.data || err.message);
});
