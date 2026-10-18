import { StyleSheet, Text } from 'react-native';
import { formatCommentTimestamp } from '../../utils/formatCommentTimestamp';
import { useGodieTheme } from '../../theme/GodieTheme';

export type CommentTimestampProps = {
  createdAt: Date | string | number;
  fontSize?: number;
};

export function CommentTimestamp({
  createdAt,
  fontSize,
}: CommentTimestampProps) {
  const theme = useGodieTheme();

  return (
    <Text
      style={[
        styles.text,
        { color: theme.textColor },
        fontSize != null && { fontSize },
      ]}
    >
      {formatCommentTimestamp(createdAt)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 12,
  },
});
