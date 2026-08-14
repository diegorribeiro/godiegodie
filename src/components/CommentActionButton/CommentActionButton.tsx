import { Pressable, StyleSheet, Text } from 'react-native';
import type {
  Comment,
  CommentActionButton as CommentActionButtonType,
  CommentActionButtonSize,
} from '../../types';

// Closed set of sizes on purpose — see CommentActionButtonSize in types.ts.
const DIMENSION_BY_SIZE: Record<CommentActionButtonSize, number> = {
  small: 28,
  medium: 36,
  large: 44,
};

export type CommentActionButtonProps = {
  button: CommentActionButtonType;
  comment: Comment;
};

export function CommentActionButton({
  button,
  comment,
}: CommentActionButtonProps) {
  const dimension = DIMENSION_BY_SIZE[button.size ?? 'medium'];

  return (
    <Pressable
      onPress={() => button.onPress(comment)}
      hitSlop={4}
      accessibilityRole="button"
      accessibilityLabel={button.accessibilityLabel ?? button.label}
      style={[
        styles.button,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
      ]}
    >
      {button.icon}
      {button.label != null && (
        <Text style={styles.label} numberOfLines={1}>
          {button.label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  label: {
    fontSize: 10,
    marginTop: 2,
  },
});
