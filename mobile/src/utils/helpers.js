// General helpers for AnnSetu mobile app

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const d = new Date(dateStr);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
};

export const timeUntil = (dateStr) => {
  if (!dateStr) return 'Expired';
  const future = new Date(dateStr);
  const now = new Date();
  const diffMs = future - now;
  if (diffMs <= 0) return 'Expired';
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m left`;
  const diffHrs = Math.floor(diffMins / 60);
  return `${diffHrs}h ${diffMins % 60}m left`;
};

export const getStatusLabel = (status) => {
  const map = {
    PENDING: 'Awaiting Pickup',
    ACCEPTED: 'Volunteer Assigned',
    PICKED_UP: 'In Transit to NGO',
    DELIVERED: 'Delivered to NGO',
    EXPIRED: 'Expired',
    CANCELLED: 'Cancelled',
  };
  return map[status] || status;
};

export const getRoleLabel = (role) => {
  const map = { donor: 'Donor', volunteer: 'Volunteer', ngo: 'NGO', admin: 'Admin' };
  return map[role] || role;
};

export const openMapsNavigation = (lat, lng, label = 'Destination') => {
  const { Linking } = require('react-native');
  const scheme = `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`;
  const webUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  Linking.canOpenURL(scheme).then((supported) => {
    Linking.openURL(supported ? scheme : webUrl);
  });
};

export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
};
