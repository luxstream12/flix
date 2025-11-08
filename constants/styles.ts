import { StyleSheet } from 'react-native';
import { colors, spacing, typography } from './theme';

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  glassEffect: {
    backgroundColor: colors.glass,
    borderTopWidth: 0.5,
    borderTopColor: colors.borderLight,
  },
  
  heading: {
    fontSize: typography.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  
  subheading: {
    fontSize: typography.xl,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  
  bodyText: {
    fontSize: typography.base,
    fontWeight: typography.weights.normal,
    color: colors.textSecondary,
    lineHeight: typography.base * typography.lineHeights.normal,
  },
  
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  buttonText: {
    fontSize: typography.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
});
