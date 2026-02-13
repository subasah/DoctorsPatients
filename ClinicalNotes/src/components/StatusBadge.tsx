// ============================================================
// Status Badge - Displays note status with color coding
// ============================================================

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NoteStatus } from '../types';
import { getStatusInfo } from '../utils/helpers';
import { FontSizes, FontWeights, Spacing, BorderRadius } from '../theme';

interface StatusBadgeProps {
  status: NoteStatus;
  size?: 'small' | 'medium' | 'large';
}

export default function StatusBadge({ status, size = 'medium' }: StatusBadgeProps) {
  const info = getStatusInfo(status);

  const sizeStyles = {
    small: { paddingH: 6, paddingV: 2, fontSize: 10, iconSize: 10 },
    medium: { paddingH: 10, paddingV: 4, fontSize: 12, iconSize: 14 },
    large: { paddingH: 14, paddingV: 6, fontSize: 14, iconSize: 16 },
  }[size];

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: info.bgColor,
          paddingHorizontal: sizeStyles.paddingH,
          paddingVertical: sizeStyles.paddingV,
        },
      ]}
    >
      <MaterialIcons
        name={info.icon as any}
        size={sizeStyles.iconSize}
        color={info.color}
      />
      <Text
        style={[
          styles.text,
          { color: info.color, fontSize: sizeStyles.fontSize },
        ]}
      >
        {info.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.round,
    gap: 4,
  },
  text: {
    fontWeight: FontWeights.semibold,
  },
});
