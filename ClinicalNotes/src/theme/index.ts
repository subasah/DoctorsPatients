// ============================================================
// Clinical Conversation Notes - Theme & Design System
// ============================================================

export const Colors = {
  // Primary palette - Medical blue
  primary: '#1A73E8',
  primaryLight: '#4A9AF5',
  primaryDark: '#0D47A1',
  primaryBg: '#E8F0FE',

  // Secondary palette - Teal for health/wellness
  secondary: '#00897B',
  secondaryLight: '#4DB6AC',
  secondaryDark: '#00695C',
  secondaryBg: '#E0F2F1',

  // Accent colors
  accent: '#FF6D00',
  accentLight: '#FF9E40',

  // Status colors
  success: '#2E7D32',
  successBg: '#E8F5E9',
  warning: '#F57F17',
  warningBg: '#FFF8E1',
  error: '#C62828',
  errorBg: '#FFEBEE',
  info: '#1565C0',
  infoBg: '#E3F2FD',

  // SOAP Section colors
  soapSubjective: '#1A73E8',
  soapObjective: '#00897B',
  soapAssessment: '#7B1FA2',
  soapPlan: '#E65100',

  // Neutrals
  white: '#FFFFFF',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E0E4E8',
  borderLight: '#F0F2F5',
  divider: '#ECEFF1',

  // Text
  textPrimary: '#1A1D21',
  textSecondary: '#5F6368',
  textTertiary: '#9AA0A6',
  textInverse: '#FFFFFF',
  textLink: '#1A73E8',

  // Recording
  recordingRed: '#D32F2F',
  recordingRedBg: '#FFCDD2',
  recordingPulse: '#EF5350',

  // Shadows
  shadowLight: 'rgba(0, 0, 0, 0.04)',
  shadowMedium: 'rgba(0, 0, 0, 0.08)',
  shadowDark: 'rgba(0, 0, 0, 0.16)',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
};

export const FontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  huge: 36,
};

export const FontWeights = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  round: 999,
};

export const Shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const Typography = {
  h1: {
    fontSize: FontSizes.huge,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: FontSizes.xxxl,
    fontWeight: FontWeights.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: FontSizes.xxl,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  h4: {
    fontSize: FontSizes.xl,
    fontWeight: FontWeights.semibold,
    color: Colors.textPrimary,
  },
  body: {
    fontSize: FontSizes.md,
    fontWeight: FontWeights.regular,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.regular,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  caption: {
    fontSize: FontSizes.xs,
    fontWeight: FontWeights.medium,
    color: Colors.textTertiary,
    letterSpacing: 0.3,
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
};
