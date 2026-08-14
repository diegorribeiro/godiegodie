import { StyleSheet, Text } from 'react-native';
import { formatCommentTimestamp } from '../../utils/formatCommentTimestamp';

export type CommentTimestampProps = {
  createdAt: Date | string | number;
  fontSize?: number;
};

export function CommentTimestamp({
  createdAt,
  fontSize,
}: CommentTimestampProps) {
  return (
    <Text style={[styles.text, fontSize != null && { fontSize }]}>
      {formatCommentTimestamp(createdAt)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
    color: '#8e8e8e',
  },
});
