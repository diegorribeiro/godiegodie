import { Pressable, StyleSheet, Text } from 'react-native';

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
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
      <Text style={styles.text}>
        {expanded
          ? 'Hide replies'
          : `See ${count} ${count === 1 ? 'reply' : 'replies'}`}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e8e',
  },
});
