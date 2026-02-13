// ============================================================
// SOAP Section Card - Collapsible card for each SOAP section
// ============================================================

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, FontWeights, BorderRadius, Shadows } from '../theme';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface SOAPField {
  key: string;
  label: string;
  value: string;
  placeholder?: string;
}

interface SOAPSectionCardProps {
  title: string;
  color: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  fields: SOAPField[];
  editable?: boolean;
  onFieldChange?: (key: string, value: string) => void;
  initiallyExpanded?: boolean;
}

export default function SOAPSectionCard({
  title,
  color,
  icon,
  fields,
  editable = false,
  onFieldChange,
  initiallyExpanded = true,
}: SOAPSectionCardProps) {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const toggleExpanded = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const filledFieldsCount = fields.filter((f) => f.value.trim()).length;

  return (
    <View style={[styles.container, { borderLeftColor: color }]}>
      {/* Header */}
      <TouchableOpacity style={styles.header} onPress={toggleExpanded} activeOpacity={0.7}>
        <View style={styles.headerLeft}>
          <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
            <MaterialIcons name={icon} size={20} color={color} />
          </View>
          <View>
            <Text style={[styles.title, { color }]}>{title}</Text>
            <Text style={styles.subtitle}>
              {filledFieldsCount}/{fields.length} fields completed
            </Text>
          </View>
        </View>
        <MaterialIcons
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color={Colors.textTertiary}
        />
      </TouchableOpacity>

      {/* Content */}
      {expanded && (
        <View style={styles.content}>
          {fields.map((field) => (
            <View key={field.key} style={styles.fieldContainer}>
              <Text style={styles.fieldLabel}>{field.label}</Text>
              {editable ? (
                <TextInput
                  style={styles.fieldInput}
                  value={field.value}
                  onChangeText={(text) => onFieldChange?.(field.key, text)}
                  placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                  placeholderTextColor={Colors.textTertiary}
                  multiline
                  textAlignVertical="top"
                />
              ) : (
                <Text style={styles.fieldValue}>
                  {field.value || 'Not documented'}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderLeftWidth: 4,
    marginBottom: Spacing.lg,
    ...Shadows.medium,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  title: {
    fontSize: FontSizes.lg,
    fontWeight: FontWeights.semibold,
  },
  subtitle: {
    fontSize: FontSizes.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  fieldContainer: {
    marginTop: Spacing.lg,
  },
  fieldLabel: {
    fontSize: FontSizes.sm,
    fontWeight: FontWeights.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  fieldInput: {
    fontSize: FontSizes.md,
    color: Colors.textPrimary,
    lineHeight: 22,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    minHeight: 60,
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
