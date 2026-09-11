// AnnSetu Brand Color Palette — matches web theme
export const COLORS = {
  // Brand greens
  primary: '#22c55e',
  primaryDark: '#16a34a',
  primaryDeep: '#15803d',
  primaryLight: '#86efac',
  primarySoft: '#dcfce7',

  // Dark backgrounds (from web darkbg / darkcard)
  bg: '#0b0f17',
  card: '#131b2e',
  cardBorder: 'rgba(255,255,255,0.08)',

  // Surface & text
  surface: '#1a2540',
  text: '#f8fafc',
  textMuted: '#94a3b8',
  textLight: '#cbd5e1',
  white: '#ffffff',
  black: '#000000',

  // Status colors
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',

  // Donation status colors
  status: {
    PENDING: '#f59e0b',
    ACCEPTED: '#3b82f6',
    PICKED_UP: '#8b5cf6',
    DELIVERED: '#22c55e',
    EXPIRED: '#ef4444',
    CANCELLED: '#6b7280',
  },

  // Input / form
  inputBg: 'rgba(255,255,255,0.06)',
  inputBorder: 'rgba(255,255,255,0.15)',
  placeholder: '#64748b',

  // Overlay
  overlay: 'rgba(0,0,0,0.6)',
};

export const FONTS = {
  regular: { fontWeight: '400' },
  medium: { fontWeight: '500' },
  semibold: { fontWeight: '600' },
  bold: { fontWeight: '700' },
  extrabold: { fontWeight: '800' },
};

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
  green: {
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
};
