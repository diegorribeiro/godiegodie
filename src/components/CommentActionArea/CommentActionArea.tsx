import { StyleSheet, View } from 'react-native';
import { CommentActionButton } from '../CommentActionButton';
import type {
  Comment,
  CommentActionButton as CommentActionButtonType,
} from '../../types';

export type CommentActionAreaProps = {
  comment: Comment;
  buttons: CommentActionButtonType[];
  direction: 'row' | 'column';
};

export function CommentActionArea({
  comment,
  buttons,
  direction,
}: CommentActionAreaProps) {
  if (buttons.length === 0) {
    return null;
  }

  return (
    <View
      style={[
        styles.container,
        direction === 'row' ? styles.row : styles.column,
      ]}
    >
      {buttons.map((button) => (
        <CommentActionButton
          key={button.id}
          button={button}
          comment={comment}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  // 10px gap with a 4px hitSlop on each button keeps adjacent hit areas
  // from ever overlapping (gap > 2 * hitSlop) — see product-manager notes
  // on comment-row click isolation.
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  column: {
    flexDirection: 'column',
    gap: 10,
  },
});
