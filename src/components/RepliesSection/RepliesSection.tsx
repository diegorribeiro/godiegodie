import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ReplyItem, type ReplyTarget } from '../ReplyItem';
import { RepliesToggle } from '../RepliesToggle';
import type { CommentReply, CommentTypography } from '../../types';

export type RepliesSectionProps = {
  replies: CommentReply[];
  typography?: CommentTypography;
  onReplyToReply: (target: ReplyTarget) => void;
};

export function RepliesSection({
  replies,
  typography,
  onReplyToReply,
}: RepliesSectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    // Every reply lives at this same indentation — see Comment.replies in
    // types.ts: single level only, never cascading deeper per reply.
    <View style={styles.wrapper}>
      <RepliesToggle
        count={replies.length}
        expanded={expanded}
        onPress={() => setExpanded((current) => !current)}
      />
      {expanded &&
        replies.map((reply) => (
          <ReplyItem
            key={reply.id}
            reply={reply}
            typography={typography}
            onReplyPress={onReplyToReply}
          />
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 6,
    paddingLeft: 40,
    gap: 8,
  },
});
