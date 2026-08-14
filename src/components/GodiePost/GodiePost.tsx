import { StyleSheet, View } from 'react-native';
import { MediaHeader } from '../MediaHeader';
import { CommentsList } from '../CommentsList';
import type { GodiePostProps } from '../../types';

const DEFAULT_MEDIA_COMMENTS_GAP = 12;

export function GodiePost({
  media,
  comments,
  commentTypography,
  commentActions,
  onReplySubmit,
  mediaCommentsGap = DEFAULT_MEDIA_COMMENTS_GAP,
  commentsBottomInset,
}: GodiePostProps) {
  return (
    <View style={styles.container}>
      <MediaHeader media={media} />
      <View style={[styles.commentsWrapper, { marginTop: mediaCommentsGap }]}>
        <CommentsList
          comments={comments}
          typography={commentTypography}
          actions={commentActions}
          onReplySubmit={onReplySubmit}
          bottomInset={commentsBottomInset}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  commentsWrapper: {
    flex: 1,
  },
});
