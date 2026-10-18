import { Pressable, StyleSheet, Text } from 'react-native';
import { useGodieTheme } from '../../theme/GodieTheme';

export type RepliesToggleProps = {
  count: number;
  expanded: boolean;
  onPress: () => void;
};

export function RepliesToggle({
  count,
  expanded,
  onPress,
}: RepliesToggleProps) {
  const theme = useGodieTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      style={styles.pressable}
    >
      <Text style={[styles.text, { color: theme.textColor }]}>
        {expanded
          ? 'Hide replies'
          : `See ${count} ${count === 1 ? 'reply' : 'replies'}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Without this, a Pressable with no explicit size stretches to fill its
  // parent's width inside a flex column (RepliesSection's wrapper) — the
  // whole row becomes tappable, not just the "See N replies" text itself.
  pressable: {
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
