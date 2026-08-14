import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../Avatar';
import { CommentTimestamp } from '../CommentTimestamp';
import { CommentActionArea } from '../CommentActionArea';
import { ReplyTrigger } from '../ReplyTrigger';
import { RepliesSection } from '../RepliesSection';
import { textStyleOverride } from '../../utils/textStyleOverride';
import { useGodieTheme } from '../../theme/GodieTheme';
import type {
  Comment,
  CommentActionsConfig,
  CommentComposerTarget,
  CommentTypography,
} from '../../types';

export type CommentItemProps = {
  comment: Comment;
  typography?: CommentTypography;
  actions?: CommentActionsConfig;
  onReplyRequested: (target: CommentComposerTarget) => void;
};

export function CommentItem({
  comment,
  typography,
  actions,
  onReplyRequested,
}: CommentItemProps) {
  const theme = useGodieTheme();
  const buttons = actions
    ? typeof actions.buttons === 'function'
      ? actions.buttons(comment)
      : actions.buttons
    : [];

  return (
    <View style={styles.outer}>
      <View style={styles.row}>
        <Avatar name={comment.author.name} uri={comment.author.avatarUri} />
        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text
              style={[
                styles.name,
                { color: theme.textColor },
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
          <Text
            style={[
              styles.text,
              { color: theme.textColor },
              ...textStyleOverride(typography?.text),
            ]}
          >
            {comment.text}
          </Text>
          <ReplyTrigger
            onPress={() =>
              onReplyRequested({
                commentId: comment.id,
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

      {comment.replies != null && comment.replies.length > 0 && (
        <RepliesSection
          replies={comment.replies}
          typography={typography}
          onReplyToReply={(target) =>
            onReplyRequested({
              commentId: comment.id,
              authorId: target.id,
              authorName: target.name,
            })
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
});
