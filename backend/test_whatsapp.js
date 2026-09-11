import whatsappService from './services/whatsappService.js';

console.log('--- Testing WhatsApp Service ---');

// 1. Test Phone Number Formatting
const testNumbers = [
  '9876543210',
  '09876543210',
  '+91 98765 43210',
  '+91-98765-43210',
  '919876543210'
];

console.log('\n[1] Phone Formatter Test:');
testNumbers.forEach(num => {
  console.log(`Original: "${num}" -> Formatted: "${whatsappService.formatPhoneNumber(num)}"`);
});

// 2. Test Welcome Message (Registration)
console.log('\n[2] Testing Welcome Message:');
await whatsappService.sendWelcomeMessage({
  name: 'Aditya Singh',
  role: 'donor',
  phone: '9876543210',
  email: 'aditya@example.com'
});

// 3. Test Login Alert
console.log('\n[3] Testing Login Alert:');
await whatsappService.sendLoginAlert({
  name: 'Aditya Singh',
  role: 'donor',
  phone: '9876543210',
  email: 'aditya@example.com'
}, '192.168.1.15', new Date());

// 4. Test Food Donation Created (Flipkart Order Confirmation style)
console.log('\n[4] Testing Food Donation Created Alert:');
await whatsappService.sendDonationCreatedAlert(
  { name: 'Aditya Singh', phone: '9876543210' },
  {
    title: '50 Packets Dal Makhani & Jeera Rice',
    quantityKg: 20,
    servingsCount: 50,
    foodCategory: 'cooked_meal',
    foodType: 'veg',
    freshnessScore: 96,
    expiryTime: new Date(Date.now() + 6 * 3600 * 1000),
    pickupLocation: { address: 'Sector 62, Noida, Uttar Pradesh' },
    pickupOtp: '849201'
  }
);

// 5. Test Volunteer Assigned Alert
console.log('\n[5] Testing Volunteer Assigned Alert:');
await whatsappService.sendVolunteerAssignedAlert(
  { name: 'Aditya Singh', phone: '9876543210' },
  { name: 'Rahul Sharma', phone: '9811223344', vehicleType: 'two-wheeler' },
  {
    title: '50 Packets Dal Makhani & Jeera Rice',
    quantityKg: 20,
    pickupLocation: { address: 'Sector 62, Noida' },
    pickupOtp: '849201',
    expiryTime: new Date(Date.now() + 6 * 3600 * 1000)
  }
);

// 6. Test Food Picked Up / Received Alert
console.log('\n[6] Testing Food Picked Up Alert:');
await whatsappService.sendPickupConfirmation(
  { name: 'Aditya Singh', phone: '9876543210' },
  { name: 'Rahul Sharma', phone: '9811223344' },
  {
    title: '50 Packets Dal Makhani & Jeera Rice',
    quantityKg: 20
  }
);

// 7. Test Food Delivery Completed Alert
console.log('\n[7] Testing Delivery Completed Alert:');
await whatsappService.sendDeliveryCompleted(
  { name: 'Aditya Singh', phone: '9876543210' },
  { organizationName: 'Goonj Foundation Community Kitchen' },
  {
    title: '50 Packets Dal Makhani & Jeera Rice',
    quantityKg: 20,
    servingsCount: 50
  }
);

console.log('\n✅ ALL WHATSAPP TEST CASES COMPLETED SUCCESSFULLY!');
