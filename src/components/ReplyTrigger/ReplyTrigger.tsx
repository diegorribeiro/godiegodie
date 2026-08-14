import { Pressable, StyleSheet, Text } from 'react-native';

export type ReplyTriggerProps = {
  onPress: () => void;
};

export function ReplyTrigger({ onPress }: ReplyTriggerProps) {
  return (
    <Pressable onPress={onPress} hitSlop={8} accessibilityRole="button">
      <Text style={styles.text}>Reply</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#8e8e8e',
  },
});
