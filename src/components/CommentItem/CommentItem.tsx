import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../Avatar';
import { CommentTimestamp } from '../CommentTimestamp';
import { CommentActionArea } from '../CommentActionArea';
import { ReplyTrigger } from '../ReplyTrigger';
import { CommentReplyComposer } from '../CommentReplyComposer';
import { RepliesSection } from '../RepliesSection';
import { textStyleOverride } from '../../utils/textStyleOverride';
import type {
  Comment,
  CommentActionsConfig,
  CommentTypography,
  ReplySubmitPayload,
} from '../../types';

export type CommentItemProps = {
  comment: Comment;
  typography?: CommentTypography;
  actions?: CommentActionsConfig;
  onReplySubmit?: (payload: ReplySubmitPayload) => void;
};

type ReplyTargetState = { authorId: string; authorName: string } | null;

export function CommentItem({
  comment,
  typography,
  actions,
  onReplySubmit,
}: CommentItemProps) {
  const [replyTarget, setReplyTarget] = useState<ReplyTargetState>(null);

  const buttons = actions
    ? typeof actions.buttons === 'function'
      ? actions.buttons(comment)
      : actions.buttons
    : [];

  function handleReplySubmit(text: string) {
    if (!replyTarget) {
      return;
    }
    onReplySubmit?.({
      commentId: comment.id,
      replyingToUserId: replyTarget.authorId,
      text,
    });
    setReplyTarget(null);
  }

  return (
    <View style={styles.outer}>
      <View style={styles.row}>
        <Avatar name={comment.author.name} uri={comment.author.avatarUri} />
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.name,
                ...textStyleOverride(typography?.authorName),
              ]}
            >
              {comment.author.name}
            </Text>
            <CommentTimestamp
              createdAt={comment.createdAt}
              fontSize={typography?.timestamp?.fontSize}
            />
          </View>
          <Text style={[styles.text, ...textStyleOverride(typography?.text)]}>
            {comment.text}
          </Text>
          <ReplyTrigger
            onPress={() =>
              setReplyTarget({
                authorId: comment.author.id,
                authorName: comment.author.name,
              })
            }
          />
        </View>
        <CommentActionArea
          comment={comment}
          buttons={buttons}
          direction={actions?.direction ?? 'column'}
        />
      </View>

      {replyTarget && (
        <View style={styles.composerWrapper}>
          <CommentReplyComposer
            placeholder={`Reply to ${replyTarget.authorName}...`}
            onSubmit={handleReplySubmit}
            onCancel={() => setReplyTarget(null)}
          />
        </View>
      )}

      {comment.replies != null && comment.replies.length > 0 && (
        <RepliesSection
          replies={comment.replies}
          typography={typography}
          onReplyToReply={(target) =>
            setReplyTarget({ authorId: target.id, authorName: target.name })
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  body: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontWeight: '600',
    fontSize: 13,
  },
  text: {
    fontSize: 13,
    marginTop: 2,
  },
  composerWrapper: {
    marginLeft: 40,
    marginTop: 6,
  },
});
