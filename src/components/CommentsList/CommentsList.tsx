import { FlatList, StyleSheet, Text, View } from 'react-native';
import { CommentItem } from '../CommentItem';
import type {
  Comment,
  CommentActionsConfig,
  CommentTypography,
  ReplySubmitPayload,
} from '../../types';

export type CommentsListProps = {
  comments: Comment[];
  typography?: CommentTypography;
  actions?: CommentActionsConfig;
  onReplySubmit?: (payload: ReplySubmitPayload) => void;
  bottomInset?: number;
};

export function CommentsList({
  comments,
  typography,
  actions,
  onReplySubmit,
  bottomInset,
}: CommentsListProps) {
  return (
    <FlatList
      data={comments}
      keyExtractor={(comment) => comment.id}
      renderItem={({ item }) => (
        <CommentItem
          comment={item}
          typography={typography}
          actions={actions}
          onReplySubmit={onReplySubmit}
        />
      )}
      style={styles.list}
      // Extra scroll room below the last row — see GodiePostProps.commentsBottomInset.
      // Applied to contentContainerStyle (not `style`), since padding there
      // becomes actual scrollable space rather than just shrinking the
      // visible viewport.
      contentContainerStyle={
        bottomInset ? { paddingBottom: bottomInset } : undefined
      }
      // Explicit false: an Android-only FlatList behavior that has caused
      // rows to become visually present but unresponsive to touch in the
      // past. Default is already false on modern RN, but this is pinned
      // deliberately now that rows contain independently-pressable
      // action buttons.
      removeClippedSubviews={false}
      ListEmptyComponent={
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No comments yet.</Text>
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
    color: '#8e8e8e',
    fontSize: 13,
  },
});
