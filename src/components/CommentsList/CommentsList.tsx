import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CommentItem } from '../CommentItem';
import { useGodieTheme } from '../../theme/GodieTheme';
import type {
  Comment,
  CommentActionsConfig,
  CommentComposerTarget,
  CommentTypography,
} from '../../types';

export type CommentsListProps = {
  comments: Comment[];
  typography?: CommentTypography;
  actions?: CommentActionsConfig;
  onReplyRequested: (target: CommentComposerTarget) => void;
  bottomInset?: number;
};

export function CommentsList({
  comments,
  typography,
  actions,
  onReplyRequested,
  bottomInset,
}: CommentsListProps) {
  const theme = useGodieTheme();

  return (
    <FlatList
      data={comments}
      keyExtractor={(comment) => comment.id}
      renderItem={({ item }) => (
        <CommentItem
          comment={item}
          typography={typography}
          actions={actions}
          onReplyRequested={onReplyRequested}
        />
      )}
      style={[styles.list, { backgroundColor: theme.backgroundColor }]}
      // Extra scroll room below the last row — see GodiePostProps.commentsBottomInset.
      // Applied to contentContainerStyle (not `style`), since padding there
      // becomes actual scrollable space rather than just shrinking the
      // visible viewport. Only used when there's no composer bar below this
      // list — the composer bar takes over the inset in that case.
      contentContainerStyle={
        bottomInset ? { paddingBottom: bottomInset } : undefined
      }
      // Explicit false: on Android, clipped subviews can leave rows visible
      // but unresponsive to touch. Default is already false on modern RN,
      // but it's pinned here because rows contain pressable action buttons.
      removeClippedSubviews={false}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: theme.textColor }]}>
            No comments yet.
          </Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
});
