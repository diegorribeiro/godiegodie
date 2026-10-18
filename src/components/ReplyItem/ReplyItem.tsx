import { StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../Avatar';
import { CommentTimestamp } from '../CommentTimestamp';
import { ReplyTrigger } from '../ReplyTrigger';
import { textStyleOverride } from '../../utils/textStyleOverride';
import { useGodieTheme } from '../../theme/GodieTheme';
import type { CommentReply, CommentTypography } from '../../types';

export type ReplyTarget = { id: string; name: string };

export type ReplyItemProps = {
  reply: CommentReply;
  typography?: CommentTypography;
  onReplyPress: (target: ReplyTarget) => void;
};

export function ReplyItem({ reply, typography, onReplyPress }: ReplyItemProps) {
  const theme = useGodieTheme();

  return (
    <View style={styles.container}>
      <Avatar name={reply.author.name} uri={reply.author.avatarUri} size={26} />
      <View style={styles.body}>
        <View style={styles.headerRow}>
          <Text
            style={[
              styles.name,
              { color: theme.textColor },
              ...textStyleOverride(typography?.authorName),
            ]}
          >
            {reply.author.name}
          </Text>
          <CommentTimestamp
            createdAt={reply.createdAt}
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
          {reply.text}
        </Text>
        <ReplyTrigger
          onPress={() =>
            onReplyPress({ id: reply.author.id, name: reply.author.name })
          }
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
    fontSize: 12,
  },
  text: {
    fontSize: 12,
    marginTop: 2,
  },
});
