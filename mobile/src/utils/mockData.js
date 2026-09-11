// Comprehensive In-App Mock Store & Fallback Engine for AnnSetu
// Ensures 100% features work on all platforms and devices even when backend is offline.

export const DEMO_USERS = {};

let mockDonations = [];

let mockNotifications = [
  {
    _id: 'notif_1',
    title: '🎉 Welcome to AnnSetu!',
    message: 'Your account is ready. Together we are bridging surplus food with those in need.',
    type: 'SYSTEM',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'notif_2',
    title: '🛵 Food Rescue Mission Available',
    message: 'New donation posted near Connaught Place (25 kg Cooked Meal).',
    type: 'DONATION',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

export const mockService = {
  // Auth
  registerUser(userData) {
    const role = userData.role || 'donor';
    const newUser = {
      _id: `user_${Date.now()}`,
      name: userData.name || 'User',
      email: userData.email.toLowerCase(),
      phone: userData.phone || '+91 9876543210',
      role: role,
      organizationName: userData.organizationName || '',
      registrationNumber: userData.registrationNumber || '',
      vehicleType: userData.vehicleType || 'two-wheeler',
      isEmailVerified: true,
      createdAt: new Date().toISOString(),
    };
    const demoOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const token = `jwt_mock_${Date.now()}`;
    return { user: newUser, token, demoOTP };
  },

  loginUser(credentials) {
    const email = credentials.email?.toLowerCase();
    let found = Object.values(DEMO_USERS).find((u) => u.email === email);
    if (!found) {
      found = {
        _id: `user_${Date.now()}`,
        name: email.split('@')[0].toUpperCase(),
        email: email,
        phone: '+91 9876543210',
        role: 'donor',
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
      };
    }
    const token = `jwt_mock_${Date.now()}`;
    return { user: found, token };
  },

  // Donations
  getMyDonations(user) {
    const list = mockDonations.filter((d) => !user || d.donor._id === user._id || d.donor.email === user.email);
    return {
      donations: list.length > 0 ? list : mockDonations,
      total: list.length > 0 ? list.length : mockDonations.length,
      page: 1,
      totalPages: 1,
    };
  },

  getAvailableDonations() {
    return mockDonations.filter((d) => d.status === 'AVAILABLE');
  },

  getNearbyDonations() {
    return mockDonations.filter((d) => ['AVAILABLE', 'ACCEPTED'].includes(d.status));
  },

  getDonationById(id) {
    return mockDonations.find((d) => d._id === id) || mockDonations[0];
  },

  createDonation(data, user) {
    const newDonation = {
      _id: `don_${Date.now()}`,
      title: data.title,
      donor: {
        _id: user?._id || 'mock_donor_101',
        name: user?.name || 'Rahul Sharma',
        phone: user?.phone || '+91 9876543210',
      },
      foodCategory: data.foodCategory || 'cooked_meal',
      foodType: data.foodType || 'veg',
      quantityKg: data.quantityKg || 10,
      status: 'AVAILABLE',
      pickupLocation: data.pickupLocation || {
        address: 'New Delhi',
        coordinates: [77.209, 28.6139],
      },
      freshnessScore: Math.floor(88 + Math.random() * 10),
      shelfLifeHours: 8,
      pickupOTP: Math.floor(100000 + Math.random() * 900000).toString(),
      imageUrl: data.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600',
      notes: data.notes || '',
      createdAt: new Date().toISOString(),
    };
    mockDonations.unshift(newDonation);
    return newDonation;
  },

  claimDonationByNgo(donationId, ngoUser) {
    const item = mockDonations.find((d) => d._id === donationId);
    if (item) {
      item.status = 'ACCEPTED';
      item.claimedByNgo = {
        _id: ngoUser?._id || 'mock_ngo_202',
        name: ngoUser?.name || 'Asha Food Foundation',
      };
    }
    return item;
  },

  getNgoInventory(ngoUser) {
    const claimed = mockDonations.filter(
      (d) => ['ACCEPTED', 'PICKED_UP', 'DELIVERED'].includes(d.status)
    );
    return {
      donations: claimed,
      totalWeightKg: claimed.reduce((sum, d) => sum + (d.quantityKg || 0), 0),
      totalMeals: claimed.reduce((sum, d) => sum + Math.round((d.quantityKg || 0) * 2.5), 0),
    };
  },

  distributeFood(donationId, beneficiaryCount, notes) {
    const item = mockDonations.find((d) => d._id === donationId);
    if (item) {
      item.status = 'DISTRIBUTED';
      item.beneficiaryCount = beneficiaryCount;
      item.distributionNotes = notes;
    }
    return { success: true, item };
  },

  // Volunteer
  getVolunteerMissions(volunteerUser) {
    const active = mockDonations.filter((d) => ['ACCEPTED', 'PICKED_UP'].includes(d.status));
    const completed = mockDonations.filter((d) => d.status === 'DELIVERED');
    return {
      activeMissions: active,
      history: completed,
      totalCompleted: completed.length,
      totalDistanceKm: 18.4,
    };
  },

  acceptVolunteerTask(donationId, volunteerUser) {
    const item = mockDonations.find((d) => d._id === donationId);
    if (item) {
      item.assignedVolunteer = {
        _id: volunteerUser?._id || 'mock_vol_303',
        name: volunteerUser?.name || 'Vikram Singh',
      };
    }
    return item;
  },

  verifyPickupOTP(donationId, otp) {
    const item = mockDonations.find((d) => d._id === donationId);
    if (item) {
      item.status = 'PICKED_UP';
    }
    return { success: true, item };
  },

  completeDelivery(donationId) {
    const item = mockDonations.find((d) => d._id === donationId);
    if (item) {
      item.status = 'DELIVERED';
    }
    return { success: true, item };
  },

  // Notifications
  getNotifications() {
    return mockNotifications;
  },

  markNotificationRead(id) {
    const n = mockNotifications.find((item) => item._id === id);
    if (n) n.isRead = true;
    return n;
  },

  markAllNotificationsRead() {
    mockNotifications.forEach((n) => (n.isRead = true));
    return mockNotifications;
  },
};
