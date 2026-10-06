import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { useFeedback } from '@/hooks/useFeedback';
import { colors, spacing } from '@/theme';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';

interface ToggleRowProps {
  icon: IconName;
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export function ToggleRow({ icon, label, description, value, onChange }: ToggleRowProps) {
  const feedback = useFeedback();
  return (
    <Pressable
      style={styles.row}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value }}
      onPress={() => {
        feedback.tap();
        onChange(!value);
      }}
    >
      <Icon name={icon} size={22} color={colors.primary} />
      <View style={styles.texts}>
        <AppText variant="bodyBold">{label}</AppText>
        {description ? (
          <AppText variant="small" color={colors.textMuted}>
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: '#CFCABF' }}
        thumbColor="#FFFFFF"
        importantForAccessibility="no"
        accessibilityElementsHidden
      />
    </Pressable>
  );
}

interface LinkRowProps {
  icon: IconName;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
}

export function LinkRow({ icon, label, value, onPress, danger }: LinkRowProps) {
  const feedback = useFeedback();
  const color = danger ? colors.error : colors.primary;
  return (
    <Pressable
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel={value ? `${label}, ${value}` : label}
      onPress={() => {
        feedback.tap();
        onPress();
      }}
    >
      <Icon name={icon} size={22} color={color} />
      <AppText variant="bodyBold" color={danger ? colors.error : colors.text} style={styles.texts}>
        {label}
      </AppText>
      {value ? (
        <AppText variant="small" color={colors.textMuted}>
          {value}
        </AppText>
      ) : null}
      <Icon name="chevron" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 56,
    paddingVertical: spacing.sm,
  },
  texts: { flex: 1 },
});
