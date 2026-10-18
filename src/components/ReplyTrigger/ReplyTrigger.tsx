import { Pressable, StyleSheet, Text } from 'react-native';
import { useGodieTheme } from '../../theme/GodieTheme';

export type ReplyTriggerProps = {
  onPress: () => void;
};

export function ReplyTrigger({ onPress }: ReplyTriggerProps) {
  const theme = useGodieTheme();

  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      accessibilityRole="button"
      style={styles.pressable}
    >
      <Text style={[styles.text, { color: theme.textColor }]}>Reply</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  // Without this, a Pressable with no explicit size stretches to fill its
  // parent's width inside a flex column (CommentItem's body) — the whole
  // row becomes tappable, not just the "Reply" text itself.
  pressable: {
    alignSelf: 'flex-start',
  },
  text: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
  },
});
