export const colors = {
  // Core colors
  background: '#000000',
  surface: '#141414',
  surfaceLight: '#2F2F2F',
  
  // Netflix red
  primary: '#E50914',
  primaryDark: '#B20710',
  primaryLight: '#F40612',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textTertiary: '#808080',
  
  // UI elements
  border: '#333333',
  borderLight: '#404040',
  glass: 'rgba(20, 20, 20, 0.85)',
  glassLight: 'rgba(47, 47, 47, 0.75)',
  
  // Semantic colors
  success: '#46D369',
  warning: '#FFA500',
  error: '#FF0000',
  info: '#0080FF',
  
  // Overlays
  overlay: 'rgba(0, 0, 0, 0.7)',
  overlayDark: 'rgba(0, 0, 0, 0.85)',
  
  // Progress
  progressBg: 'rgba(255, 255, 255, 0.3)',
  progressFill: '#E50914',
  
  // Additional UI colors
  surfaceElevated: '#1F1F1F',
};

export const typography = {
  // Font sizes
  xs: 10,
  sm: 12,
  base: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  xxxl: 24,
  display: 32,
  hero: 40,
  
  // Font weights
  weights: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  // Line heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  huge: 48,
};

export const borderRadius = {
  sm: 4,
  base: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
};

export const animations = {
  fast: 200,
  normal: 300,
  slow: 500,
  carousel: 10000,
};
